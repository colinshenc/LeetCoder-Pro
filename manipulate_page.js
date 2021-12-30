import { data_num_sessions, data_acceptance } from "./parse_ts.js";

/**
 * Script to change Status column to corresponding session count number.
 *
 * Status class notes:
 * * Accepted: text-green-s
 * * Error: text-yellow
 * * Not tried: text-gray-5
 */

var problems_table = document.querySelector("div[role='rowgroup']");
var problems_rows = problems_table.querySelectorAll("div[role='row']");

/**
 * Function to manipulate Status column.
 *
 * For each row:
 * 1. Check if current problem is accepted
 * 2. If accepted, check if current problem is in DATA IMPORTED
 * 3. If is in,
 * 3-1. replace "Status" column value with session count number
 * 3-2. add "Your Acceptance" column value
 * 4. If not in, add empty "Your Acceptance" column value
 * 5. Add `Your Acceptance` new column name
 *
 * Future update:
 * 1. Construct https://developer.mozilla.org/en-US/docs/Web/API/NodeList live `NodeList` and update when expanding # of problems,
 *    or do other stuff while url does not change per page.
 */
var each_row = function (row_element_nodes) {
  var problem_status = row_element_nodes[0].childNodes[0];
  var problem_title = row_element_nodes[1].childNodes[0];
  // var problem_acceptance = row_element_nodes[3].childNodes[0];

  // Check if accepted
  var is_accepted = problem_status.classList.contains("text-green-s");
  var current_problem = null;

  if (is_accepted) {
    var title_selector = problem_title.querySelector(".h-5");
    if (title_selector != null) {
      current_problem = title_selector.childNodes[0].textContent;
    }
  }

  // Check if in DATA IMPORTED
  var session_count = null;
  if (
    current_problem != null &&
    Object.keys(data_num_sessions).includes(current_problem)
  ) {
    session_count = data_num_sessions[parseInt(current_problem)];
  }

  // Replace "Status" column
  if (session_count != null) {
    const session_count_item = document.createElement("span");
    session_count_item.innerHTML = `&#x2713 ${session_count}`;
    session_count_item.classList.add("text-olive");
    session_count_item.classList.add("dark:text-dark-olive");

    problem_status.replaceWith(session_count_item);
  }
};

problems_rows.forEach((element) => each_row(element.childNodes));
