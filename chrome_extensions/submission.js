//console.log("HERE");
chrome.storage.sync.get('buttonState', function (data) {
  console.log('buttonState', data['buttonState']);
  if (data['buttonState'] == 1) {
    var btn = document.createElement("BUTTON")
    var t = document.createTextNode("CLICK ME");
    btn.appendChild(t);
    //Appending to DOM 
    document.body.appendChild(btn);


    //get problem numbers every 1000ms from DOM.
    //console.log(Date.now());

    var last_problems_on_page;
    var curr_problems_on_page;
    modify_col_titles();
    console.log('buttonState', data['buttonState']);

    setInterval(() => {
      curr_problems_on_page = Array.from(document.querySelectorAll(".h-5"))
        .filter((node) => node.innerHTML.match("\\d+\\.( \\w*)+"))
        .map((node) =>
          parseInt(node.innerText.substring(0, node.innerText.indexOf(".")))
        );
      if (
        curr_problems_on_page === undefined ||
        curr_problems_on_page.length == 0 ||
        JSON.stringify(last_problems_on_page) ==
        JSON.stringify(curr_problems_on_page)
      ) {
        return;
      }
      console.log("1");
      console.log('buttonState', data['buttonState']);

      modify_col_titles();
      console.log("2");
      getSubmissions(curr_problems_on_page).then((json_data) => {
        console.log("3");
        console.log(curr_problems_on_page);
        var session_data = get_num_sessions(json_data);
        var acc_data = get_acc_rate(json_data);
        console.log(session_data);
        console.log("4");
        add_data_to_rows(session_data, acc_data);
        console.log("5");
        chrome.storage.sync.set({ 'buttonState': 1 }, function () {
          console.log('Status saved');
        })
      });

      last_problems_on_page = curr_problems_on_page;
    }, 1000);

    //data['buttonState'] == 1;
  
  }
  // chrome.tabs.query({ url: "https://leetcode.com/problemset/*" }, function (tab) {
  //    chrome.tabs.reload(tab[0].id)
  //})
})



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
    var backendId =
      allProblemStatus[frontendId.toString()]["stat"]["question_id"];
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
        "User-Agent": window.navigator.userAgent,
        Accept: "*/*",
        "Accept-Language": "en-US,en;q=0.5",
        "content-type": "application/json",
        "Sec-Fetch-Dest": "empty",
        "Sec-Fetch-Mode": "cors",
        "Sec-Fetch-Site": "same-origin",
        Cookie:
          "csrftoken=" + csrftoken + "; LEETCODE_SESSION=" + leetcode_session,
      },
      referrer:
        "https://leetcode.com/problems/" + questionSlug + "/submissions/",
      body:
        '{"operationName":"Submissions","variables":{"offset":0,"limit":100,"lastKey":null,"questionSlug":"' +
        questionSlug +
        '"},"query":"query Submissions($offset: Int!, $limit: Int!, $lastKey: String, $questionSlug: String!) {\\n  submissionList(offset: $offset, limit: $limit, lastKey: $lastKey, questionSlug: $questionSlug) {\\n    lastKey\\n    hasNext\\n    submissions {\\n      id\\n      statusDisplay\\n      lang\\n      runtime\\n      timestamp\\n      url\\n      isPending\\n      memory\\n      __typename\\n    }\\n    __typename\\n  }\\n}\\n"}',
      method: "POST",
      mode: "cors",
    }).then(async (response) => {
      if (response.ok) {
        return response.json();
      } else {
        console.log(frontendId + " request 429");
        return await makeRequest();
      }
    });
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
      "User-Agent": window.navigator.userAgent,
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
  var promises = [];
  submissionIds.forEach((e) => {
    if (
      e in allProblemStatus &&
      allProblemStatus[e.toString()]["status"] != null
    ) {
      promises.push(
        getSubmissionById(e).then((data) => (json[e.toString()] = data))
      );
    }
  });

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
    var sub_count = 1;
    var last_ts = json_data[qNum][0];
    for (var sub of json_data[qNum]) {
      if (Math.abs(last_ts - sub.timestamp) > 86400) {
        sub_count = sub_count + 1;
      }
      last_ts = sub.timestamp;
    }
    result[qNum] = sub_count;
  }
  return result;
};

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

var modify_col_titles = () => {
  create_new_col_headers();
  create_empty_row_entries();
};

var create_new_col_headers = () => {
  if (
    document.querySelector(".new_acc_col") ||
    document.querySelector(".sess_col")
  ) {
    return;
  }
  var problems_table = document.querySelector("div[role='rowgroup']");
  var problems_colnames =
    problems_table.previousSibling.childNodes[0].querySelectorAll(
      ".overflow-ellipsis"
    );
  var status_col;
  var acc_col;
  var title_col;
  for (var e of problems_colnames) {
    if (e.innerHTML.includes("Status")) {
      status_col = e;
    } else if (e.innerHTML.includes("Acceptance")) {
      acc_col = e;
    } else if (e.innerHTML.includes("Title")) {
      title_col = e;
    }
  }
  var new_acc_col = acc_col.cloneNode(false);
  new_acc_col.innerHTML = "Personal Acceptance";
  new_acc_col.classList.add("new_acc_col");
  title_col.parentNode.insertBefore(new_acc_col, title_col);

  var sess_col = acc_col.cloneNode(false);
  sess_col.innerHTML = "# of Times Done";
  sess_col.classList.add("sess_col");
  title_col.parentNode.insertBefore(sess_col, title_col);
};

var create_empty_row_entries = () => {
  var problems_table = document.querySelector("div[role='rowgroup']");
  var rows = problems_table.querySelectorAll("div[role='row']");

  for (var row of rows) {
    if (row.querySelector(".acc") || row.querySelector(".sess")) {
      continue;
    }
    var acc_div = document.createElement("div");
    acc_div.setAttribute(
      "style",
      "box-sizing: border-box; flex: 50 0 auto; min-width: 0px; width: 50px;"
    );
    var sess_div = document.createElement("div");
    sess_div.setAttribute(
      "style",
      "box-sizing: border-box; flex: 30 0 auto; min-width: 0px; width: 30px;"
    );
    acc_div.setAttribute("role", "cell");
    acc_div.classList.add("acc");
    acc_div.innerHTML = "";
    sess_div.setAttribute("role", "cell");
    sess_div.innerHTML = "";
    sess_div.classList.add("sess");
    var title_element = row.querySelectorAll("div[role='cell']")[1];
    title_element.parentNode.insertBefore(acc_div, title_element);
    title_element.parentNode.insertBefore(sess_div, title_element);
  }
};

var add_data_to_rows = (data_num_sessions, data_acceptance) => {
  var qNums = new Set(Object.keys(data_num_sessions));
  var problems_table = document.querySelector("div[role='rowgroup']");
  var rows = problems_table.querySelectorAll("div[role='row']");
  for (var row of rows) {
    var sess_div = row.querySelector(".sess");
    var acc_div = row.querySelector(".acc");
    if (!(sess_div && acc_div)) {
      continue;
    }
    sess_div.innerHTML = "";
    acc_div.innerHTML = "";
    var qNum = row
      .querySelector(".h-5")
      .innerHTML.substring(0, row.querySelector(".h-5").innerHTML.indexOf("."));
    if (qNums.has(qNum)) {
      sess_div.innerHTML = `${data_num_sessions[qNum]}`;
      acc_div.innerHTML = `${(data_acceptance[qNum] * 100).toFixed(0)}%`;
    }
  }
};

