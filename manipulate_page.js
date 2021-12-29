// import data_num_sessions from SOMEWHERE

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
 * Function to manipulate Status column for each row.
 *
 * 1. Check if current problem is accepted
 * 2. If accepted, check if current problem is in DATA IMPORTED
 * 3. If is in, replace "Status" column `svg` with session count number following "Acceptance" column class styles
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
  //   var is_accepted = problem_status.classList.contains(".text-green-s") != null;
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
  // After data imported: if (current_problem != null && current_problem in DATA_IMPORTED) {
  if (current_problem != null && current_problem == "1") {
    // Problem set to "1" by default
    // After data imported: session_count = QUERY_SESSEION_COUNT;
    session_count = 11;
  }

  // Replace "Status" column
  if (session_count != null) {
    const session_count_item = document.createElement("span");
    session_count_item.innerHTML = `<span>${session_count}</span>`;

    problem_status.replaceWith(session_count_item);
  }
};

problems_rows.forEach((element) => each_row(element.childNodes));
