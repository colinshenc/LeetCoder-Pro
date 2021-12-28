function getCookieValue(name) {
  value = document.cookie.match('(^|;)\\s*' + name + '\\s*=\\s*([^;]+)')?.pop()
  if (value == undefined) {
      throw 'cannot find cookie ' + name
  }
}

async function getSubmissionJSON(questionSlug) {
    submissionJSON = await fetch("https://leetcode.com/graphql", {
        "method": "POST",
        "mode": "cors",
        "referrer": 'https://leetcode.com/problems/' + questionSlug + '/',
        "credentials": "include",
        "headers": {
            "User-Agent": window.navigator.userAgent,
            "Accept": "*/*",
            "Accept-Language": "en-US,en;q=0.5",
            "content-type": "application/json",
            "x-csrftoken": getCookieValue('csrftoken'),
            "Sec-Fetch-Dest": "empty",
            "Sec-Fetch-Mode": "cors",
            "Sec-Fetch-Site": "same-origin"
        },
        "body": '{\"operationName\":\"Submissions\",\"variables\":{\"offset\":0,\"limit\":20,\"lastKey\":null,\"questionSlug\":\"' + questionSlug + '\"},\"query\":\"query Submissions($offset: Int!, $limit: Int!, $lastKey: String, $questionSlug: String!) {\\n  submissionList(offset: $offset, limit: $limit, lastKey: $lastKey, questionSlug: $questionSlug) {\\n    lastKey\\n    hasNext\\n    submissions {\\n      id\\n      statusDisplay\\n      lang\\n      runtime\\n      timestamp\\n      url\\n      isPending\\n      memory\\n      __typename\\n    }\\n    __typename\\n  }\\n}\\n\"}',
    }).then(response => response.json())
    return submissionJSON
}