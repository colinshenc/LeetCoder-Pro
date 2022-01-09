 <h2>LeetCoder Pro</h2>
 <h3>A simple LeetCode browser extension that provides software engineer interview prepers key problem familiarity data points. :hugs: :100:</h3>

**Statistics definition** 
 - Session: Two submissions count as two different sessions if they are submitted more than one day apart.
 - Acceptance Rate(personal): Ratio of accepted submissions to all submissions.
 
 **Key files**
 - ```manifest.json```: Config file that contains key details of the browser extension and tells the browser to run ```submission.js``` when page finishing reloading. 
  - ```submission.js```: Script that asynchronously fetch submission data from LeetCode using browser's cookies API```getSubmissions()```. After getting the data, processing them and generating data points to be displayed on LeetCode's problems page. Finally display the data inside two columns added on the page.

***Contributors***
- Vincenqwu(https://github.com/Vincenqwu)
- twaddwa(https://github.com/twaddwa)
- AnnieNew(https://github.com/AnnieNew)
- Cheng Shen(https://github.com/colinshenc)

![alt text](https://github.com/colinshenc/Leetcode_familiarity_add_on/blob/main/extensions/images/logo6.png)

> Written by Cheng Shen with [StackEdit](https://stackedit.io/).
> Jan 6, 2022
