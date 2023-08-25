//key=API_KEY
//AIzaSyAk6KQXu1lJ0LUNFiJQYVqt_licw99KWeE

function onInstall(e) {
  onOpen(e);
}

// create custom menu
function onOpen(e) {
  var ui = DocumentApp.getUi();
  ui.createMenu("Pipewriter")
    .addItem("App", "showFormInSidebar")
    .addSeparator()
    .addItem("format to HTML", "doc2html")
    .addItem("delete </>", "deleteHTMLtags")
    .addItem("HTML to Pipe", "html2doc")
    .addSeparator()
    .addItem("Gray Background", "grayBg")
    .addItem("Dark Gray BG", "darkGrayBg")
    .addItem("White Background", "whiteBg")
    .addToUi();
}

function showFormInSidebar() {      
  var form = HtmlService.createTemplateFromFile('Index').evaluate().setTitle('Pipewriter');
  var userProperties = PropertiesService.getUserProperties();
  DocumentApp.getUi().showSidebar(form);
}


// #1 data model for UI elements

function createUIElement() {
  return {
    textContent: '',
    formattedContent: '',
    wordCount: 0,
    rowCount: 0,
    cellCount: 0
  };
}

var uiElementIds = [
  'container-center',
  'background-empty',
  'background-light',
  'zz-left',
  'zz-right',
  'placeholder',
  'blurbs-3',
  'list-2',
  'blurbs-vert-3',
  'button-left',
  'button-center',
  'button-right',
  'cards-2',
  'cards-3',
  'cards-2x2',
  'diocane',
  'styleguide'
];

var uiElements = {};

uiElementIds.forEach(function(id) {
  uiElements[id] = createUIElement();
});


// #2 get all UI element IDs from master

function populateUIElements() {
  var masterDocId = '1uMdieQCJeBQCvkHs7w9ZiVeEB2_cglkF7ZLgeqvxL0U';

  var masterBody = DocumentApp.openById(masterDocId).getBody();

  // Get the total number of child elements in the master document's body.
  var numElements = masterBody.getNumChildren();

  var currentId = null;

  // Iterate over all the child elements in the master document's body.
  for(var i=0; i<numElements; i++) {
    var element = masterBody.getChild(i);

    // If the element is a paragraph, check if its text is a UI element ID.
    if(element.getType() == DocumentApp.ElementType.PARAGRAPH) {
      var text = element.getText();
      if(uiElements.hasOwnProperty(text)) {
        currentId = text; // Remember the ID to associate the next table with it.
      }
    } 
    // If the element is a table and there's a current ID remembered, add the table to the corresponding UI element in uiElements.
    else if(element.getType() == DocumentApp.ElementType.TABLE && currentId !== null) {
      var table = element.copy();
      uiElements[currentId].table = table; // Save a copy of the table.

      // numeric data about table content
      uiElements[currentId].wordCount = table.getText().split(' ').length; 
      uiElements[currentId].rowCount = table.getNumRows();
      uiElements[currentId].cellCount = table.getRow(0).getNumCells();
      // TODO add more properties

      // save text content in the object

      var textContent = "";
      for (var r = 0; r < table.getNumRows(); r++) {
        var row = table.getRow(r);
        for (var c = 0; c < row.getNumCells(); c++) {
          var cell = row.getCell(c);
          textContent += cell.getText() + " "; // Add a space between texts from different cells.
        }
      }
      uiElements[currentId].textContent = textContent.trim(); // Remove the trailing space and save the text content.

      currentId = null; // Reset the current ID.
    }
  }
}

// #3 wireframe with elements to cursor

function getElement(uiElementId) {
 
  // if uiElementId is not found in uiElements, return with an error message
  if(!uiElements[uiElementId]){
    console.log("Invalid UI element requested: " + uiElementId);
    return false;
  }

  // Retrieve the cursor from the active document
  var cursor = DocumentApp.getActiveDocument().getCursor();

  // if no cursor is present, return with an alert message
  if(!cursor){
    DocumentApp.getUi().alert('Put the cursor where you want to insert');
    return false;
  }

  var cursorElem = cursor.getElement();
  var parent = cursorElem.getParent();
  var body = DocumentApp.getActiveDocument().getBody();

  try {
    // Get the child index of the element where the cursor is.
    var offset = parent.getChildIndex(cursorElem);
  } catch(e) {
    console.log('Error: ', e);
    // If an error occurs (e.g., cursor not inside any child), set offset to 0.
    var offset = 0;
  }

  // Copy the table from the corresponding UI element in uiElements.
  var masterTable = uiElements[uiElementId].table.copy();

  // Check if the cursor is inside a table cell.
  if(parent.getType() == DocumentApp.ElementType.TABLE_CELL) {
    parent.insertTable(offset + 1, masterTable); 
  } else {
    body.insertTable(offset + 1, masterTable);
  }

  // Return the UI element info as a simple, JSON-compatible object
  return {
// 230812 by AL 
//    textContent: textContent,
//    wordCount: wordCount,
    textContent: cursorElem.asText().getText(),
    wordCount: cursorElem.asText().getText().split(' ').length,
  }
}

// run first to fill uiElements with data
// AL: init GS global vars with external functions (Google Drive) is not due to different auth mode 
try{
populateUIElements();
}catch(e){}

for (var id in uiElements) {
  console.log("plain text for '" + id + "': " + uiElements[id].textContent);
}

// 4. convert wireframe to ai-friendly text

function aiReadDoc() {
  var doc = DocumentApp.getActiveDocument();
  var cursor = doc.getCursor();
  var body = doc.getBody();
  var cursorPosition = body.getChildIndex(cursor.getElement());

  // special naming convention for text to prepend
  var prependHeading = ['','h2: ', 'h3: ', 'feature or button: ', 'eyebrow: ', 'p: ']; 
  var prependHtml = ['','h2','h3','h4','h5','p'];

  // returned as object
  var readText = ""; //plain text output
  var readUx = ""; //store the format `h2: Headline` etc.
  var readHtml = ""; //store the format `<h2>Headline</h2> etc.

  // Manually map paragraph headings to integer equivalents
  var headingMap = {
    'HEADING1': 0,
    'HEADING2': 1,
    'HEADING3': 2,
    'HEADING4': 3,
    'HEADING5': 4,
    'HEADING6': 5
  }

  // Loop through all elements up to the cursor position
  for (var i = 0; i <= cursorPosition; i++) {
    var element = body.getChild(i);
    
    // If element is a paragraph
    if (element.getType() === DocumentApp.ElementType.PARAGRAPH) {
      var paragraph = element.asParagraph();
      if (paragraph.getHeading() !== DocumentApp.ParagraphHeading.NORMAL) {
        var heading = paragraph.getHeading(); // Get the heading level
        var headingIndex = headingMap[heading.toString()]; // Convert the heading level to an integer

        var text = paragraph.getText(); // Get the plain text

        readText += text + "\n"; // Append the plain text to readText
        readUx += prependHeading[headingIndex] + text + "\n"; // Append the formatted text to readUx
        readHtml += "<" + prependHtml[headingIndex] + ">" + text + "</" + prependHtml[headingIndex] + ">\n";
      }
    } 
    // If the element is a table, process it as before
    else if (element.getType() === DocumentApp.ElementType.TABLE) {
      var table = element.asTable();
      var numRows = table.getNumRows();
      // console log "table has X rows"
      for (var j = 0; j < numRows; j++) {
        var row = table.getRow(j);
        var numCells = row.getNumCells();
        for (var k = 0; k < numCells; k++) {
          var cell = row.getCell(k);
          var numChildren = cell.getNumChildren();
          for (var l = 0; l < numChildren; l++) {
            var child = cell.getChild(l);
            if (child.getType() === DocumentApp.ElementType.PARAGRAPH) {
              var paragraph = child.asParagraph();
              if (paragraph.getHeading() !== DocumentApp.ParagraphHeading.NORMAL) {
                
                var heading = paragraph.getHeading(); // Get the heading level
                var headingIndex = headingMap[heading.toString()]; // Convert the heading level to an integer

                var text = paragraph.getText(); // Get the plain text

                readText += text + "\n"; // Append the plain text to readText
                readUx += prependHeading[headingIndex] + text + "\n"; // Append the formatted text to readUx
                readHtml += "<" + prependHtml[headingIndex] + ">" + text + "</" + prependHtml[headingIndex] + ">\n"; // Append the HTML formatted text to readHtml
              }
            }
          }
        }
      }
    }
  }

  // return readText, readUx, readHtml
  return { readText: readText, readUx: readUx, readHtml: readHtml };
}