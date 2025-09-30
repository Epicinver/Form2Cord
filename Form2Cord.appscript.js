function onFormSubmit(e) {
  var webhookUrl = PropertiesService.getScriptProperties().getProperty("DISCORD_WEBHOOK"); // use propertiesservice (script properties in appsscript settings)
  if (!webhookUrl) return;

  var naerr = "not be answered/this form may be bugged";
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
    if (!answer) answer = "N/A";
    if (typeof answer === "string" && answer.indexOf(",") > -1) answer = answer.split(",").map(function(a){ return a.trim(); }).join(", ");
    if (typeof answer === "string" && answer.startsWith("http")) answer = "[File uploaded. Click to view.](" + answer + ")";
    if (!isNaN(answer) && Number(answer) === parseFloat(answer)) answer = answer.toString();
    if (typeof answer === "boolean") answer = answer ? "Yes" : "No";
    if (answer.length > 1024) answer = answer.substring(0, 1020) + "...";
    var fieldName = (answer === "N/A") ? `(${naerr}) ${question}` : question;
    fields.push({ name: fieldName + ":", value: answer.toString(), inline: false });
  }

var timestamp = new Date();
if (responses[0]) {
  var parsed = Date.parse(responses[0]);
  if (!isNaN(parsed)) {
    timestamp = new Date(parsed);
  }
}
var utcString = Utilities.formatDate(timestamp, Session.getScriptTimeZone(), "yyyy-MM-dd HH:mm:ss");


  var email = "Not collected";
  for (var j = 0; j < headers.length; j++) {
    if (headers[j] && headers[j].toLowerCase().includes("email")) {
      email = responses[j] || "Not provided";
      break;
    }
  }

  var embed = {
    title: "New response submitted to '" + formName + "'",
    color: 9693459,
    fields: fields,
    author: { name: "Google Form: " + formName },
    footer: { text: "Submitted at " + utcString + (email !== "Not collected" ? " | Submitted by: " + email : "") }
  };

  var payload = JSON.stringify({ content: null, embeds: [embed] });

  try {
    UrlFetchApp.fetch(webhookUrl, { method: "post", contentType: "application/json", payload: payload, muteHttpExceptions: true });
  } catch (err) {}
}
