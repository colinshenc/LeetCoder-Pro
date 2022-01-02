// this file runs on the web page and cannot access chrome.cookie api

var allProblemStatus = null;

// wrapper to get cookie value
async function getCookieValue(cookieName) {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(
      chrome.runtime.id,
      { name: cookieName },
      (response) => {
        if (response) {
          resolve(response);
        } else {
          reject("Cannot find cookie " + cookieName);
        }
      }
    );
  });
}

// get submission history of a problem by its id
async function getSubmissionById(frontendId) {
  var csrftoken = await getCookieValue("csrftoken");
  var leetcode_session = await getCookieValue("LEETCODE_SESSION");

  if (allProblemStatus == null) {
    allProblemStatus = await getUserAllProblemStatus();
  }

  // console.log(frontendId, allProblemStatus[frontendId.toString()]);
  try {
    var backendId = allProblemStatus[frontendId.toString()]["stat"]["question_id"];
    var questionSlug =
      allProblemStatus[frontendId.toString()]["stat"]["question__title_slug"];
  } catch (error) {
    // console.log(error);
    // console.log(frontendId, backendId, allProblemStatus[frontendId.toString()]);
  }

  // make http request to get the submission history json

  var makeRequest = async () => {
    return await fetch("https://leetcode.com/graphql", {
        credentials: "include",
        headers: {
          "User-Agent":
            window.navigator.userAgent,
          Accept: "*/*",
          "Accept-Language": "en-US,en;q=0.5",
          "content-type": "application/json",
          "Sec-Fetch-Dest": "empty",
          "Sec-Fetch-Mode": "cors",
          "Sec-Fetch-Site": "same-origin",
          Cookie:
            "csrftoken=" + csrftoken + "; LEETCODE_SESSION=" + leetcode_session,
        },
        referrer: "https://leetcode.com/problems/" + questionSlug + "/submissions/",
        body:
          '{"operationName":"Submissions","variables":{"offset":0,"limit":100,"lastKey":null,"questionSlug":"' +
          questionSlug +
          '"},"query":"query Submissions($offset: Int!, $limit: Int!, $lastKey: String, $questionSlug: String!) {\\n  submissionList(offset: $offset, limit: $limit, lastKey: $lastKey, questionSlug: $questionSlug) {\\n    lastKey\\n    hasNext\\n    submissions {\\n      id\\n      statusDisplay\\n      lang\\n      runtime\\n      timestamp\\n      url\\n      isPending\\n      memory\\n      __typename\\n    }\\n    __typename\\n  }\\n}\\n"}',
        method: "POST",
        mode: "cors",
      }
    ).then(async (response) => {
      if(response.ok) {
        return response.json();
      } else {
        console.log(questionId + " request 429");
          return await makeRequest();
      }
    })
  };

  var json = await makeRequest();
  // console.log(json)
  return json["data"]["submissionList"]["submissions"];
}

// get user's all problems status
// from https://leetcode.com/api/problems/algorithms/
async function getUserAllProblemStatus() {
  var csrftoken = await getCookieValue("csrftoken");
  var leetcode_session = await getCookieValue("LEETCODE_SESSION");

  var json = await fetch("https://leetcode.com/api/problems/algorithms/", {
    method: "GET",
    mode: "cors",
    credentials: "include",
    headers: {
      "User-Agent":
        window.navigator.userAgent,
      Accept:
        "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
      "Accept-Language": "en-US,en;q=0.5",
      "Sec-Fetch-Dest": "document",
      "Sec-Fetch-Mode": "navigate",
      "Sec-Fetch-Site": "none",
      "Sec-Fetch-User": "?1",
      Cookie:
        "csrftoken=" + csrftoken + "; LEETCODE_SESSION=" + leetcode_session,
    },
  }).then((response) => response.json());

  // rebuild json with frontend_question_id as key for faster lookup
  var newJson = {};
  for (var i = 0; i < json["stat_status_pairs"].length; i++) {
    var problem = json["stat_status_pairs"][i];
    newJson[problem["stat"]["frontend_question_id"].toString()] = problem;
  }

  return newJson;
}

// get the submission information from a list of question ids
async function getSubmissions(submissionIds) {
  if (allProblemStatus == null) {
    allProblemStatus = await getUserAllProblemStatus();
  }

  var json = {};
  var promises = []
  submissionIds.forEach((e) => {
    if ((e in allProblemStatus) && allProblemStatus[e.toString()]["status"] != null) {
        promises.push(getSubmissionById(e).then(data => json[e.toString()] = data));
    }
  })

  await Promise.all(promises);
  return json;
}

/**
 * Input JSON string-submissions data.Output map with key as question number, value as session count.
 */
const get_num_sessions = (json_data) => {
  var result = {};
  //var json_data = JSON.parse(data);
  for (var qNum in json_data) {
    //console.log(qNum);
    //console.log(json_data[qNum]);
    var sub_count = 1;
    var last_ts = json_data[qNum][0];
    for (var sub of json_data[qNum]) {
      //console.log(sub.timestamp);
      if (Math.abs(last_ts - sub.timestamp) > 86400) {
        sub_count = sub_count + 1;
      }
      last_ts = sub.timestamp;
    }
    result[qNum] = sub_count;
  }
  return result;
};

//const data_num_sessions = get_num_sessions(data);

/**
 * Input JSON string-submissions data. Output map with key as question number, value as acceptance rate.
 */
const get_acc_rate = (json_data) => {
  var result = {};
  var ac_count = 0;
  for (var qNum in json_data) {
    var ac_count = json_data[qNum].reduce((prev_count, curr) => {
      prev_count = curr.statusDisplay.includes("Accepted")
        ? prev_count + 1
        : prev_count;
      return prev_count;
    }, 0);
    result[qNum] = (ac_count / json_data[qNum].length).toFixed(2);
  }
  return result;
};

//const data_acceptance = get_acc_rate(data);
//export { data_num_sessions, data_acceptance };

//NEW changes, get problem numbers every 500ms from DOM.
//console.log(Date.now());
var last_problems_on_page;
var curr_problems_on_page;
setInterval(() => {
  curr_problems_on_page = Array.from(document.querySelectorAll(".h-5"))
    .filter((node) => node.innerHTML.match("\\d+\\.( \\w*)+"))
    .map((node) =>
      parseInt(node.innerText.substring(0, node.innerText.indexOf(".")))
    );
  if (
    JSON.stringify(last_problems_on_page) ==
    JSON.stringify(curr_problems_on_page)
  ) {
    return;
  }
  console.log(curr_problems_on_page);
  getSubmissions(curr_problems_on_page)
    .then((json_data) => {
      console.log("begin");
      return get_acc_rate(json_data);
    }) //get_num_sessions or get_acc_rate
    .then((data) => console.log(data));
  last_problems_on_page = curr_problems_on_page;
}, 1000);
