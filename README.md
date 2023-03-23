# Table of Contents

[**1.** **Introduction to Crypto Portfolio Command line Programme**](#_toc130486827)\*\*

[**2.** **How to use**](#_toc130486828)

[3. Language Stack and packages used](#_toc130486829)

[a. Node.js:](#_toc130486830)

[b. Axios package:](#_toc130486831)

[c. Chalk@4.1.2 package:](#_toc130486832)

[d. Yargs package:](#_toc130486833)

[e. Boxen@5.1.2 package:](#_toc130486834)

[f. Csv-parse package:](#_toc130486835)

[g. Console-table-printer package:](#_toc130486836)

[h. Nodemon package:](#_toc130486837)

[**4.** **Various design decisions**](#_toc130486838)

[a. First Approach](#_toc130486839)

[b. Second Approach](#_toc130486840)

[**5.** **Error Handling**](#_toc130486841)

[a. When reading csv file](#_toc130486842)

[b. When interact with the user for commands, user may enter wrong commands or arguments or both](#_toc130486843)

[c. When requesting data from crypto compare using axios](#_toc130486844)

[**6.** **Glossary**](#_toc130486845)

[a. Worker threads in Node js](#_toc130486846)

[b. Libuv](#_toc130486847)

1. ## <a name="_toc130486827"></a>**Introduction to Crypto Portfolio Command line Programme**

![](ss/Aspose.Words.e9c3061a-2170-4f03-8719-b9d73390d86d.001.png)

`    `This is an attempt to create a program that manipulates a CSV file containing daily user transactions.

`    `The program should provide four types of results:

- The latest portfolio value per token in USD (when no parameters are given)
- The latest portfolio value for a specific token in USD (when a token is given)
- The portfolio value per token in USD on a specific date (when a date is given)
- The portfolio value of a specific token in USD on a specific date (when a date and token are given)

`    `The data includes timestamps, transaction types (DEPOSIT or WITHDRAW), tokens (BTC, ETH, XRP), and token amounts.

1. ## <a name="_toc130486828"></a>**How to use**

- Download the repo and Install dependencies:

`                    `npm install

`              `Important:

`              `Make sure transactions.csv file is saved in **crypto portfolio** folder.

- Run the application by using following command and then follow the instructions thereafter

`              `npm start

![](ss/Aspose.Words.e9c3061a-2170-4f03-8719-b9d73390d86d.002.png)

Note:

` `Application will take some initial boot time depending on your computer performance and size of the csv file. Thereafter it will continue to run smoothly

1. ## <a name="_toc130486829"></a>Language Stack and packages used

1. ### <a name="_toc130486830"></a>Node.js:

   Node.js is an open-source server environment that allows developers to run JavaScript on the server-side. It provides a platform for building fast, scalable, and highly performant network applications using an event-driven, non-blocking I/O model.

1. ### <a name="_toc130486831"></a>Axios package:

   ` `Axios is a popular Promise-based HTTP client for JavaScript that can be used in both browser and Node.js environments. It provides an easy-to-use API for sending HTTP requests and handling responses, supporting features such as interceptors, request cancellation, and automatic JSON parsing.

1. ### <a name="_toc130486832"></a>Chalk@4.1.2 package:

   Chalk is a Node.js package that provides a simple way to add color and styling to the console output. It is used to customize the look and feel of the command-line interface (CLI) by adding color to text, changing the background color, and applying other formatting options.

1. ### <a name="_toc130486833"></a>Yargs package:

   Yargs is a Node.js package that helps to build interactive command-line tools, by providing a simple and intuitive way to define commands, arguments, and options. It makes it easy to create powerful CLI applications by abstracting away much of the complexity of handling command-line input.

1. ### <a name="_toc130486834"></a>Boxen@5.1.2 package:

   ` `Boxen is a Node.js package that allows developers to create nicely formatted boxes in the console. It provides a simple way to create visually appealing terminal messages, complete with custom borders, colors, and other styling options.

1. ### <a name="_toc130486835"></a>Csv-parse package:

   Csv-parse is a Node.js package that provides a way to parse CSV files and convert them into a JavaScript object. It can handle complex CSV data with support for features like custom delimiters, line breaks, headers, and more.

1. ### <a name="_toc130486836"></a>Console-table-printer package:

   ` `Console-table-printer is a Node.js package that allows developers to create tables in the console output. It provides an easy-to-use API for generating tables with customizable headers, footers, and cell styles.

1. ### <a name="_toc130486837"></a>Nodemon package:

   Nodemon is a Node.js package that helps to develop Node.js applications by monitoring for any changes in the code and automatically restarting the server. It makes the development process more efficient by reducing the need to manually restart the server after each change.

1. ## <a name="_toc130486838"></a>**Various design decisions**

` `I was able to solve the problem using two different approaches.

1. ### <a name="_toc130486839"></a>First Approach

In this approach, the application reads a CSV file and processes data for each of the four requests. The yargs package is used to ask for commands. Since the data was fairly large, a simple read of data was not possible. Therefore, the data was read as a stream line by line and processed as data come and assigned to an object. To handle this data stream easily, the csv-parse npm package was used. However, for each command that the user requested, the application needed to go through all the data in the CSV file, which is nearly 1GB in size. As node.js normally runs on a single thread, we have to wait for this single thread to read and process all the data. In this approach, it would take around 60s to give output for each request.

To overcome this issue, **worker threads** were used to read the CSV file from multiple points in parallel using extra threads allocated for node.js in libuv thread pool for asynchronous tasks like reading a file. There were two options to divide the CSV file between each thread:

1. ` `Simply measure the file size of csv file and divide by number of threads : but some data leaks happens in this approach.so I have decide to not to go with it
1. Assign each threads to read predefined number of records.

` `Example:

here I have optimize the application for reading 30 Million of csv records by dividing 30 million records between each thread, also I have kept open last worker thread’s end limit undefined , so I can use this application to read any number of records.

Here data processed fine, so I have decide to go with this approach.

By using threads to execute the programme I have mange to reduce execution time by **50%** (30s)But I found following drawbacks in above approach.

the program had to read the CSV file again and again for each request. This meant that each request would take around 30s to output the result. Therefore, the second approach was chosen to overcome this drawback.

1. ### <a name="_toc130486840"></a>Second Approach

To avoid the drawback of the first approach I have decide to go with following approach to the problem.

1. #### In the first execution of the code, programme is reading the data while processed these data in a way, it will save the cumulative balances up to date in an object that uses relevant date as the key.

`                            `![](ss/Aspose.Words.e9c3061a-2170-4f03-8719-b9d73390d86d.003.png)

1. #### So then I simply have to go through that object to find the needed data for each option like below.

1) ` `To return the latest portfolio value per token in USD, the program will search for the latest date key in the object and retrieve the corresponding token values. Then, it will request the latest USD rates for each token from the cryptocompare API by using the inner object keys. The program will multiply the token values by their respective USD rates to obtain the portfolio value per token in USD.

![](ss/Aspose.Words.e9c3061a-2170-4f03-8719-b9d73390d86d.004.png)

1. To return the latest portfolio value for a specific token in USD, the program will search for the latest date key in the object and retrieve the token balance for the specified token. It will then request the latest USD rate for that token from the cryptocompare API and multiply the token balance by the USD rate to obtain the portfolio value of the token in USD.

`                              `![](ss/Aspose.Words.e9c3061a-2170-4f03-8719-b9d73390d86d.005.png)

1. To return the portfolio value per token in USD on a specific date, the program will search for the date key in the object and retrieve the corresponding token values. If the date key is not available, the program will use the latest available date before the specified date. The program will then request the historical USD rates for each token from the cryptocompare API and multiply the token values by their respective USD rates to obtain the portfolio value per token in USD on the specified date.

![](ss/Aspose.Words.e9c3061a-2170-4f03-8719-b9d73390d86d.006.png)

1. To return the portfolio value of a specific token in USD on a specific date, the program will search for the date key in the object and retrieve the token balance for the specified token. If the date key is not available, the program will use the latest available date before the specified date. The program will then request the historical USD rate for the specified token from the cryptocompare API and multiply the token balance by the USD rate to obtain the portfolio value of the token in USD on the specified date.

`              `![](ss/Aspose.Words.e9c3061a-2170-4f03-8719-b9d73390d86d.007.png)

- One of the major problem:

While getting historic data is in crypto compare API data is not available beyond Sunday, July 18, 2010 12:00:00 AM GMT+05:30.beyond that date USD rates of crypto currencies are zero. (Of course since crypto not available beyond the particular time)

![C:\Users\SAJEEWA\Desktop\propine\problems occured\ss\beyond.png](ss/Aspose.Words.e9c3061a-2170-4f03-8719-b9d73390d86d.008.png)

##

1. ## <a name="_toc130486841"></a>**Error Handling**

In this programme there are major events that causes errors.

1. ### <a name="_toc130486842"></a>When reading csv file
   `               `There are several potential errors that can occur when reading a CSV file in a Node.js program

- File not found: If the CSV file does not exist or is not in the correct location, the program will generate a "File not found" error. This I have handled.

![C:\Users\SAJEEWA\Pictures\Screenshots\Screenshot 2023-03-22 230536.png](ss/Aspose.Words.e9c3061a-2170-4f03-8719-b9d73390d86d.009.png)

- File permissions, CSV format, Encoding issues, Memory issues and Disk I/O errors commonly handled

1. ### <a name="_toc130486843"></a>When interact with the user for commands, user may enter wrong commands or arguments or both

- I have added validator to validate dates from the user

`                            `![](ss/Aspose.Words.e9c3061a-2170-4f03-8719-b9d73390d86d.010.png)

- Also checking with crypto compare api for valid token

`                             `![](ss/Aspose.Words.e9c3061a-2170-4f03-8719-b9d73390d86d.011.png)

- Also, Error handling added for different user commands other than the defined ones.

`                           `![](ss/Aspose.Words.e9c3061a-2170-4f03-8719-b9d73390d86d.012.png)

1. ### <a name="_toc130486844"></a>When requesting data from crypto compare using axios

`                     `Following results are taken while airplane mode on pc

`                    `![](ss/Aspose.Words.e9c3061a-2170-4f03-8719-b9d73390d86d.013.png)

1. ## <a name="_toc130486845"></a>**Glossary**

1. ### <a name="_toc130486846"></a>Worker threads in Node js

Worker threads is a built-in module in Node.js that provides a way to run JavaScript code in separate threads, enabling developers to execute CPU-intensive tasks without blocking the event loop. With worker threads, Node.js applications can leverage the full power of modern multi-core CPUs by creating and managing multiple threads, each with its own event loop and shared memory space. This can result in significantly improved performance and reduced response times for applications that require heavy processing or large amounts of data. Worker threads also supports message passing between threads, allowing developers to exchange data and coordinate work between threads in a safe and efficient manner.

1. ### <a name="_toc130486847"></a>Libuv

Libuv is a multi-platform support library that provides asynchronous I/O operations, networking, and event-loop functionality for Node.js. It abstracts the underlying system differences between Windows, macOS, and Linux, providing a consistent API for network and file system operations.

Node.js utilizes libuv to handle non-blocking I/O operations and to manage events in the event loop. It provides an event-driven, non-blocking I/O model that allows Node.js to handle high concurrency with a minimal amount of overhead.

By default, libuv uses a thread pool with four threads to perform I/O operations. This thread pool size can be increased by setting the UV_THREADPOOL_SIZE environment variable to a value greater than four.
