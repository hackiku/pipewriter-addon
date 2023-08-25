// Act as an expert Google Apps script developer specialized in google docs. You know Docs specific methods by heart and never use methods exclusive to Sheets, Slides etc. With that said, today we’re continuing building pipewriter, a wireframing app for writers in Google Docs. It’s a template formatted with tables as wireframing elements, and the kicker is an add-on sidebar with AI included. Acknowledge & analyze, and let’s get to building

// that is a lovely analysis, great start! The template & sidebar are MVP but work for now. We’re working on the AI integration. See the code below. It works for the Rewrite functionality that’s confined to the sidebar, but now we need to interact with the actual wireframe in the google doc. Here'sthe js.html of the apps script project:



//key=API_KEY
//AIzaSyAk6KQXu1lJ0LUNFiJQYVqt_licw99KWeE

/*     _                          _ _            
 _ __ (_)_ __   _____      ___ __(_) |_ ___ _ __ 
| '_ \| | '_ \ / _ \ \ /\ / / '__| | __/ _ \ '__|
| |_) | | |_) |  __/\ V  V /| |  | | ||  __/ |   
| .__/|_| .__/ \___| \_/\_/ |_|  |_|\__\___|_|   
|_|     |_|                                      
<div> <body> <br> <button> <canvas> <code>
<embed> <img> <section> <svg> <title> */


//CREATE CUSTOM MENU
function onOpen() {
  var ui = DocumentApp.getUi();
  ui.createMenu("Pipewriter")
    .addItem("Sidebar", "showFormInSidebar")
    .addSeparator()
    .addItem("format to HTML", "doc2html")
    .addItem("delete </>", "deleteHTMLtags")
    .addItem("HTML to Pipe", "html2doc")
    .addSeparator()
    .addItem("format prompt", "formatPrompt")
    .addItem("role prompt", "rolePrompt")
    .addToUi();
}


var uiElements = [
  'headline-empty',
  'fullwidth-empty',
  'fullwidth-light',
  'lr-left',
  'lr-right',
  'placeholder',
  'blurbs-3',
  'list-2',
  'blurbs-vert-3',
  'button-left',
  'button-center',
  'button-right',
  'cards-2',
  'cards-3',
  'cards-2x2'
];


//====================================================================

  /* __  _ _
  | '_ \| '_ \
  | |_) | |_) |
  | .__/| .__/
  |_|   |*/


//OPEN THE FORM IN SIDEBAR 
/* 
function showFormInSidebar() {      
  var form = HtmlService.createTemplateFromFile('Index').evaluate().setTitle('Pipewriter elements');
  DocumentApp.getUi().showSidebar(form);
}
*/

function showFormInSidebar() {      
  var form = HtmlService.createTemplateFromFile('Index').evaluate().setTitle('Pipewriter');
  var userProperties = PropertiesService.getUserProperties();
  var selectedText = userProperties.getProperty('selectedText');
  var savedText = '';
  if (selectedText) {
    savedText = '<p>' + selectedText + '</p>';
  }
  form.append('<script>document.getElementById("saved-text").innerHTML = "' + savedText + '";</script>');
  DocumentApp.getUi().showSidebar(form);
}


function do_Insert(opt, arg){
  console.log('do_Insert: ', opt, arg);
  if (!opt) return false;
  
  if (opt.param1 === 'structure_1') runCopyFunction(0,{})
  else if (opt.param1 === 'structure_2') runCopyFunction(1,{})
  else if (opt.param1 === 'structure_X') runCopyFunction(15,{})
  //else if (opt.param1 === 'structure_X2') runCopyFunction(14,{})
  
  else if (opt.param1 === 'lrwhiteleft') runCopyFunction(2,{copyWithTemp:true})
  else if (opt.param1 === 'lrwhiteright') runCopyFunction(3,{copyWithTemp:true})
  //else if (opt.param1 === 'lrlightleft') runCopyFunction(4,{copyWithTemp:true})
  //else if (opt.param1 === 'lrlightright') runCopyFunction(6,{copyWithTemp:true})
  else if (opt.param1 === 'lrdarkleft') runCopyFunction(10,{copyWithTemp:true})
  //else if (opt.param1 === 'lrdarkright') runCopyFunction(8,{copyWithTemp:true})
  
  
  else if (opt.param1 === 'blurbshorizwhite') runCopyFunction(12,{copyWithTemp:true})
  //else if (opt.param1 === 'blurbshorizlight') runCopyFunction(13,{copyWithTemp:true})
  else if (opt.param1 === 'blurbshorizdark') runCopyFunction(15,{copyWithTemp:true})
  //else if (opt.param1 === 'blurbsvertwhite') runCopyFunction(17,{copyWithTemp:true})
  //else if (opt.param1 === 'blurbsvertlight') runCopyFunction(18,{copyWithTemp:true})
  //else if (opt.param1 === 'blurbsvertdark') runCopyFunction(20,{copyWithTemp:true})
  
  //else if (opt.param1 === 'cards1x2') runCopyFunction(22,{copyWithTemp:true})
  else if (opt.param1 === 'cards1x3') runCopyFunction(23,{copyWithTemp:true})
  //else if (opt.param1 === 'cards2x2') runCopyFunction(24,{copyWithTemp:true})
  //else if (opt.param1 === 'cards2x3') runCopyFunction(25,{copyWithTemp:true})
  
  else if (opt.param1 === 'buttons1_1') runCopyFunction(26,{addSmallHeader:false})
  else if (opt.param1 === 'buttons1_2') runCopyFunction(27,{addSmallHeader:false})
  else if (opt.param1 === 'buttons1_3') runCopyFunction(28,{addSmallHeader:false})
  else if (opt.param1 === 'buttons1_4') runCopyFunction(30,{addSmallHeader:false})
  else if (opt.param1 === 'buttons1_5') runCopyFunction(31,{addSmallHeader:false})
  else if (opt.param1 === 'buttons1_6') runCopyFunction(32,{addSmallHeader:false})
  
  else if (opt.param1 === 'buttons2_1') runCopyFunction(33,{addSmallHeader:false})
  else if (opt.param1 === 'buttons2_2') runCopyFunction(34,{addSmallHeader:false})
  else if (opt.param1 === 'buttons2_3') runCopyFunction(35,{addSmallHeader:false})
  else if (opt.param1 === 'buttons2_4') runCopyFunction(37,{addSmallHeader:false})
  else if (opt.param1 === 'buttons2_5') runCopyFunction(38,{addSmallHeader:false})
  else if (opt.param1 === 'buttons2_6') runCopyFunction(39,{addSmallHeader:false})
  
  //myTestFunction()
}

function runCopyFunction(arg1, params) {
  
  /*var otherBody = DocumentApp.openById('1C7RGuzeyFrIDyYI9o6CWrOD-1MoK72YwNTo_iLTd16Y').getBody()
  var otherTable = otherBody.getTables()[arg1].copy()
  var xElem = DocumentApp.getActiveDocument().getCursor().getElement();
  var body = DocumentApp.getActiveDocument().getBody();
  var offset = body.getChildIndex(xElem);  
  var insertedTable = body.insertTable(offset + 1, otherTable);*/
  
  var masterDocId = '1C7RGuzeyFrIDyYI9o6CWrOD-1MoK72YwNTo_iLTd16Y';
  
  var otherBody = DocumentApp.openById(masterDocId).getBody()
  var otherTable = otherBody.getTables()[arg1].copy()
 
  var numCells = otherTable.getRow(0).getNumCells();//could it be table without row?
  var tableOrig_Width = 0;
  for (var i = 0; i<numCells; i++){
    var w = otherTable.getColumnWidth(i); // * 0.0138889; // conversion of points to inches
    tableOrig_Width += w;
    //console.log('w(', i ,'): ', w);//in inches
  }
  //console.log('tableOrig_Width: ', tableOrig_Width);//
  
  var cursor = DocumentApp.getActiveDocument().getCursor();
  
  var selection = DocumentApp.getActiveDocument().getSelection();
  if (selection) {
    var elements = selection.getRangeElements();
    
    var start = elements[0].getElement();
    //var preStart = start.getPreviousSibling();
    //if (!preStart) preStart = start.getParent();
    
    //var startParent = start.getParent();
    //console.log('startParent: ', startParent.getType().name())
    //console.log('start: ', start.getType().name())
    //if (startParent.getType() == 'TABLE_CELL') start = startParent;
    
    //var position = DocumentApp.getActiveDocument().newPosition(startParent, 0);
    var position = DocumentApp.getActiveDocument().newPosition(start, 0);
    //var position = DocumentApp.getActiveDocument().newPosition(preStart, 0);
    //DocumentApp.getActiveDocument().setCursor(position);
    
    for (var i = 0; i < elements.length; i++) {
      var element = elements[i];
      //console.log('sel getType: ', element.getElement().getType().name())
      //console.log('sel parent getType: ', element.getElement().getParent().getType().name())
      //element.getElement().removeFromParent();//complications from removing element. Hard to place cursor in correct spot
    }
    
    DocumentApp.getActiveDocument().setCursor(position);
    cursor = DocumentApp.getActiveDocument().getCursor();
  }

  //cursor warning
  
  if(!cursor){
    DocumentApp.getUi().alert('Place cursor where you want to insert the element!');
    return false;
  }
  
  var cursorElem = cursor.getElement();
  //var elemOffset = cursor.getOffset();
  var parent = cursorElem.getParent()
  
  //todo: if no cursor, but selection - should insert into beginning of selection or show error message?
  
  console.log('cursorElem getType: ', cursorElem.getType().name())
  console.log('cursorElem parent: ', parent.getType().name())
  console.log('cursorElem getPreviousSibling: ', cursorElem.getPreviousSibling())
  //console.log('cursorElem getPreviousSibling: ', body.getChild(childIndex))
  //console.log('elemOffset: ', elemOffset)
  
  var body = DocumentApp.getActiveDocument().getBody();
  try {
    var offset = parent.getChildIndex(cursorElem);
    //console.log('offset: ', offset);
  } catch(e) {
    console.log('errX: ', e);
    var offset = 0;
  }
  
  //ministyle 1PT FONT
  
  var ministyle = {};
  ministyle[DocumentApp.Attribute.FONT_SIZE] = 1;
  
  if (parent.getType() == 'TABLE_CELL') {
    var yTable;
    // for some reasons cannot insert into cell directly from other table (when there are images).
    // Workaround - insert into current document, then copy new table and insert it into cell, then remove redundant table
    
    //if (params && params.addSmallHeaderFooter) parent.insertParagraph(offset + 1, '').setAttributes(ministyle); //line2
      
    if (params && params.copyWithTemp){
      var insertedTable = body.appendTable(otherTable);
      yTable = parent.insertTable(offset + 1, insertedTable.copy());
      insertedTable.removeFromParent();
    } else yTable = parent.insertTable(offset + 1, otherTable)

    //scale correction, if pasted in table
    //can be determined by some params? params.needScale
    if (true){
      var numCells_Y = yTable.getRow(0).getNumCells();
      //console.log('numCells: ', numCells_Y);
      
      var newpar = yTable.getParent();
      var newparWidth = newpar.getWidth();
      newparWidth -= 10;//correction for padding
      //console.log('par width: ', newparWidth, newparWidth * 0.0138889)
      
      var ratio = tableOrig_Width / newparWidth;
      console.log('ratio: ', ratio);
      
      if (ratio>1) for (var i = 0; i<numCells_Y; i++){
        var w = yTable.getColumnWidth(i);
        yTable.setColumnWidth(i, w / ratio);
        //console.log('ratio*w(', i ,'): ', w/ratio);
      }
    }
    
    if (params && (params.addSmallHeaderFooter || params.addSmallHeader)) parent.insertParagraph(offset + 1, '').setAttributes(ministyle); //line1
  } else {
    if (params && params.addSmallHeaderFooter) body.insertParagraph(offset + 1, '').setAttributes(ministyle); //line2
    var insertedTable = body.insertTable(offset + 1, otherTable);
    if (params && (params.addSmallHeaderFooter || params.addSmallHeader)) body.insertParagraph(offset + 1, '').setAttributes(ministyle); //line1
  }
  
}

function myTestFunction() {
  var body = DocumentApp.getActiveDocument().getBody();
  
  var pageWidth = body.getPageWidth();
  
  var xTable = body.getTables()[2];//table original
  //var xTable = body.getTables()[1];//table that needs to be scaled
  
  var numR = xTable.getNumRows();
  var numCells = xTable.getRow(0).getNumCells();
  console.log('numCells: ', numCells)
  //console.log('X: ', xTable.getColumnWidth(2) * 0.0138889)
  var tableOrig_Width = 0;
  for (var i = 0; i<numCells; i++){
    var w = xTable.getColumnWidth(i); // * 0.0138889; // conversion of points to inches
    tableOrig_Width += w;
    console.log('w(', i ,'): ', w);//in inches
  }
  
  console.log('tableOrig_Width: ', tableOrig_Width);//

  var yTable = body.getTables()[1];
  
  var numCells_Y = yTable.getRow(0).getNumCells();
  //console.log('numCells: ', numCells_Y);

  var newpar = yTable.getParent();
  var newparWidth = newpar.getWidth();
  newparWidth -= 10;//correction for padding
  console.log('par width: ', newparWidth, newparWidth * 0.0138889)
  
  var ratio = tableOrig_Width / newparWidth;
  console.log('ratio: ', ratio);
  
  for (var i = 0; i<numCells_Y; i++){
    var w = yTable.getColumnWidth(i);
    yTable.setColumnWidth(i, w / ratio);
    console.log('ratio*w(', i ,'): ', w/ratio);
  }
 
  return true;
    
  
  var selection = DocumentApp.getActiveDocument().getSelection();
  if (selection) {
    var elements = selection.getRangeElements();

    var start = elements[0].getElement();
    var position = DocumentApp.getActiveDocument().newPosition(start, 0);
    var cursor = DocumentApp.getActiveDocument().setCursor(position);
    
    for (var i = 0; i < elements.length; i++) {
      var element = elements[i];
      //console.log('sel getType: ', element.getElement().getType().name())
      //console.log('sel parent getType: ', element.getElement().getParent().getType().name())
      element.getElement().removeFromParent();
    }
    
  }
  
}

/*
structure_1 0 
structure_2 1 
structure_X 15 
structure_X2 14 

lrwhiteleft 2 
lrwhiteright 3 
lrlightleft 4 
lrlightright 6 
lrdarkleft 10 
lrdarkright 8 

blurbshorizwhite 12 
blurbshorizlight 13 
blurbshorizdark 15 
blurbsvertwhite 17 
blurbsvertlight 18 
blurbsvertdark 20 

cards1x2 22 
cards1x3 23 
cards2x2 24 
cards2x3 25 

buttons1_1 26
buttons1_2 27

buttons1_3 28
buttons1_4 30
buttons1_5 31
buttons1_6 32

buttons2_1 33
buttons2_2 34
buttons2_3 35
buttons2_4 37
buttons2_5 38
buttons2_6 39
*/