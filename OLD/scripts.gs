
// simple add table 

function tableAdd() {
var body = DocumentApp.getActiveDocument().getBody();

// define content that goes into the table
var headlineCopy = "LR dark white";
var paragraphCopy = "Write up to 35 words. The image is an editable Google Drawing."
var asset = "<google drawing>";
var empty = 1;

// Create a two-dimensional array contpning the cell contents.
var cells = [
  [headlineCopy + '\n' + paragraphCopy, '', asset ],
];

// Build a table from the array.
body.appendTable(cells);

}

function tableAdd() {
    var body = DocumentApp.getActiveDocument().getBody();

    // define content that goes into the table.
    var headlineCopy = "LR dark white";
    var paragraphCopy = "Write up to 35 words. The image is an editable Google Drawing."
    var asset = "<google drawing>";

    // Create a two-dimensional array containing the cell contents.
    var cells = [
    [headlineCopy + '\n' + paragraphCopy, '', asset ],
    ];

// Build a table from the array.
body.appendTable(cells);

}


// ========================= html2doc =======================================


function html2doc() {
  // Get the body of the active document
  const body = DocumentApp.getActiveDocument().getBody();

  // Get the text of the body
  const textAll = body.getText();

  // Split the text into lines
  const lines = textAll.split("\n");

  // Initialize an empty string to store modified text
  let storedText = "";

  // Loop through each line in the text
  for (let i = 0; i < lines.length; i++) {
    // Get the current line
    const line = lines[i].trim();

    // Check if the line starts with an HTML tag
    if (line.startsWith("<")) {
      // Get the tag name
      const tagName = line.substring(1, line.indexOf(">")).toLowerCase();

      // Get the text inside the tag
      const tagText = line.substring(line.indexOf(">") + 1, line.lastIndexOf("<")).trim();

      // Create a new paragraph with the appropriate heading level based on the tag name
      let paragraph = null;
      switch (tagName) {
        case "h2":
          // Add an empty paragraph before every Heading 2 paragraph
          if (storedText) {
            body.appendParagraph("").setHeading(DocumentApp.ParagraphHeading.NORMAL);
          }
          paragraph = body.appendParagraph(tagText).setHeading(DocumentApp.ParagraphHeading.HEADING2);
          break;
        case "h3":
          // Add an empty paragraph before every Heading 3 paragraph
          if (storedText) {
            body.appendParagraph("").setHeading(DocumentApp.ParagraphHeading.NORMAL);
          }
          paragraph = body.appendParagraph(tagText).setHeading(DocumentApp.ParagraphHeading.HEADING3);
          break;
        case "h4":
          paragraph = body.appendParagraph(tagText).setHeading(DocumentApp.ParagraphHeading.HEADING4);
          break;
        case "h5":
          paragraph = body.appendParagraph(tagText).setHeading(DocumentApp.ParagraphHeading.HEADING5);
          break;
        case "p":
          paragraph = body.appendParagraph(tagText).setHeading(DocumentApp.ParagraphHeading.HEADING6);
          break;
        default:
          // If the tag name is not recognized, ignore the line
          break;
      }

      // Add a new line after the paragraph
      if (paragraph) {
        storedText += line + "\n";
      }
    }
  }
}


// ========================= deleteHTMLtags =======================================


function deleteHTMLtags() {
  var doc = DocumentApp.getActiveDocument();
  var body = doc.getBody();
  
  var tags = ["<h2>", "</h2>", "<h3>", "</h3>", "<h4>", "</h4>", "<h5>", "</h5>", "<h6>", "</h6>", "<p>", "</p>"];

  for (var i = 0; i < tags.length; i += 2) {
    body.replaceText(tags[i] + "|" + tags[i + 1], "");
  }
}


// ========================= html2doc =======================================


function doc2html() {
  const body = DocumentApp.getActiveDocument().getBody();

  const paras = body.getParagraphs();

  // Initialize an empty string to store modified text
  let modifiedText = ``;

  // Loop through each paragraph in the document
  for (let i = 0; i < paras.length; i++) {
    // Get the current paragraph
    const para = paras[i];

    // Check if the paragraph is a heading paragraph (i.e., not of normal type)
    if (
      para.getType() === DocumentApp.ElementType.PARAGRAPH &&
      para.getHeading() !== DocumentApp.ParagraphHeading.NORMAL
    ) {
      // Get the level of the heading
      const level = para.getHeading();

      // Get the text of the heading
      const text = para.getText();

      // Check if the heading text is not empty
      if (text.trim() !== "") {
        // Create a Markdown string based on the level and text of the heading
        let markdown = "";
        if (level === DocumentApp.ParagraphHeading.HEADING1) {
          markdown = text;
        } else if (level === DocumentApp.ParagraphHeading.HEADING2) {
          markdown = "<h2>" + text + "</h2>";
        } else if (level === DocumentApp.ParagraphHeading.HEADING3) {
          markdown = "<h3>" + text + "</h3>";
        } else if (level === DocumentApp.ParagraphHeading.HEADING4) {
          markdown = "<h4>" + text + "</h4>";
        } else if (level === DocumentApp.ParagraphHeading.HEADING5) {
          markdown = "<h5>" + text + "</h5>";
        } else if (level === DocumentApp.ParagraphHeading.HEADING6) {
          markdown = "<p>" + text + "</p>";
        }
        modifiedText += markdown + "\n";
      }
      // Remove the heading paragraph
      //if (para.getNextSibling()) {
        // para.removeFromParent();
      //}
    }
  }
  // Prepend the modified text at the beginning of the document
  body.insertParagraph(0, modifiedText);
}


