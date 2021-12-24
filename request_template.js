fetch("https://leetcode.com/graphql", {
  headers: {
    "content-type": "application/json",
  },
  body: '{"operationName":"Submissions","variables":{"offset":0,"limit":20,"lastKey":null,"questionSlug":"CHANGE HERE TO QUESTION SLUG"},"query":"query Submissions($offset: Int!, $limit: Int!, $lastKey: String, $questionSlug: String!) {\\n  submissionList(offset: $offset, limit: $limit, lastKey: $lastKey, questionSlug: $questionSlug) {\\n    lastKey\\n    hasNext\\n    submissions {\\n      id\\n      statusDisplay\\n      lang\\n      runtime\\n      timestamp\\n      url\\n      isPending\\n      memory\\n      __typename\\n    }\\n    __typename\\n  }\\n}\\n"}',
  method: "POST",
})
  .then((response) => response.json())
  .then((data) => console.log(data));
