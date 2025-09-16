function onFormSubmit(e) {
  var webhookUrl = "";
  
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

    if (Array.isArray(answer)) {
      answer = answer.join(", ");
    }

    if (typeof answer === "string" && answer.startsWith("http")) {
      answer = "[A file has been uploaded. Click to view.](" + answer + ")";
    }

    fields.push({
      name: question + ":",
      value: answer.toString(),
      inline: false
    });
  }

  var timestamp = responses[0] || new Date().toISOString();

  var email = "Not collected";
  if (headers[1] && headers[1].toLowerCase().includes("email")) {
    email = responses[1] || "Not provided";
  }

  
  var embed = {
    title: "An answer to '" + formName + "' has been submitted.",
    color: 9693459,
    fields: fields,
    author: {
      name: "From the Google Form " + "'" + formName + "'"
    },
    footer: {
      text: "Submitted at " + timestamp + (email !== "Not collected" ? " | Submitted by: " + email : "")
    }
  };

  // POST to webhook
  var payload = JSON.stringify({
    content: null,
    embeds: [embed],
    attachments: []
  });

  UrlFetchApp.fetch(webhookUrl, {
    method: "post",
    contentType: "application/json",
    payload: payload
  });
}
