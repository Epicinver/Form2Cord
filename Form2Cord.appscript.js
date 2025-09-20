function onFormSubmit(e) {
  var webhookUrl = ""; /* webhook */

  var naerr = "not be answered/this form may be bugged";  /* goes before question name if answer is N/A */
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var form = FormApp.openByUrl(ss.getFormUrl());
  var formName = form.getTitle();

  var responses = e.values; 
  var sheet = ss.getActiveSheet();
  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];

  var fields = [];

  for (var i = 0; i < responses.length; i++) {
    var question = headers[i];
    var answer = responses[i];

    if (!question || question.toLowerCase() === "timestamp") continue;

    if (!answer) {
      answer = "N/A";
    }

    if (typeof answer === "string" && answer.indexOf(",") > -1) {
      answer = answer.split(",").map(function(a){ return a.trim(); }).join(", ");
    }

    if (typeof answer === "string" && answer.startsWith("http")) {
      answer = "[File uploaded. Click to view.](" + answer + ")";
    }

    if (!isNaN(answer) && Number(answer) === parseFloat(answer)) {
      answer = answer.toString();
    }

    if (typeof answer === "boolean") {
      answer = answer ? "Yes" : "No";
    }

    var fieldName = (answer === "N/A") ? `(${naerr}) ${question}` : question;

    fields.push({
      name: fieldName + ":",
      value: answer.toString(),
      inline: false
    });
  }

  var timestamp = responses[0] ? new Date(responses[0]) : new Date();
  var utcString = timestamp.toISOString().replace("T", " ").replace("Z", " UTC");

  var email = "Not collected";
  if (headers[1] && headers[1].toLowerCase().includes("email")) {
    email = responses[1] || "Not provided";
  }

  var embed = {
    title: "New response submitted to '" + formName + "'",
    color: 9693459,
    fields: fields,
    author: { name: "Google Form: " + formName },
    footer: { text: "Submitted at " + utcString + (email !== "Not collected" ? " | Submitted by: " + email : "") }
  };

  var payload = JSON.stringify({
    content: null,
    embeds: [embed]
  });

  UrlFetchApp.fetch(webhookUrl, {
    method: "post",
    contentType: "application/json",
    payload: payload
  });
}
