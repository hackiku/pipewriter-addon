


ok perfect, we’ll need that logic later. Here’s the deal now:

I need to write a readBackward.gs script that will pipe the text content of the wireframe to OpenAI. 

# how pipe works
First some context for you. Here's how the website copywriting wireframes work:

- web copy is written only in headings 1 through 6. They all serve functions like:
  -- main headline (heading 2, heading 3)
  -- blurb title or button text (heading 4)
  -- eyebrow copy/label (heading 5)
  -- paragraph text (heading 6)
  -- normal paragraph style is NOT used for web copy. It's used only for temporary notes and spacing
  -- heading 1 is for naming sections like "hero", "features" etc. and it is NOT used for web copy
- UI elements are mocked up with tables. E.g. a zig-zag section is a table with one row and 3x columns:
  - one for headline (heading 2) and description (headline 6)
  - the middle one as a spacer (no content)
  - the last for a mockup of a graphical asset drawn in Google Drawings

# readBackward.gs

With the script now we want to:
1. loop through the wireframe from the beginning until the point our cursor's at
2. Save the HEADING-only text content in the order it appears in the doc
3. Save the headline type of each piece of text we're saving
4. BONUS: Ideally, we want to guess the type of layout each block of text belongs to (zigzag, blurbs, headline block with button etc.) and convey that information to OpenAI
5. pass the data to the main aiWriter() function in js.html with a custom prompt to invent and write the next UX section of the page


# format

`h1: Section titles (not for web copy)
h2: Main headline
h3: Secondary headline
h4: Button
h5: Eyebrow label
h6: Paragraph copy`

so just adding “hX: “ to each bit of text extracted





hang on pls check the whole code below. Basically all 3 functions are entertwined and should feed one another:

1. aiRead() calls a .gs script to save all website copy into the readObject object
2. createPrompt() checks if we're rewriting or inserting, then creates the right 'slivers' (saved text or the whole readObject), and adds it to a prompt that's ready to share with openai
3. aiWrite() takes the prompt as created previously and generates completion

What could be going wrong? Maybe this part, which I fiddled with trying to just load the readUx property of the object into OpenAI (it's important i do this for debugging)

    } else if (aiMode === 'insert') {
      slivers = JSON.stringify(readObject.readUx); 
      prompt = `${roleplay} ${insert}.
      Write the new copy to fit neatly after all previous sections of the page:
      ${slivers}`;
    }


-----


maybe i was mistaken in keeping slivers a global variable, or introducing it too late. why don't we update the slivers inside aiRead() and call it a day? See this:

function aiRead() {
  return new Promise((resolve, reject) => {
    google.script.run
      .withSuccessHandler((result) => {
        readObject = result; // Update the global variable with the result from the server
        document.getElementById('readText').innerText = readObject.readText;
        document.getElementById('readUx').innerText = readObject.readUx;
        document.getElementById('readHtml').innerText = readObject.readHtml;
        resolve(readObject); // Resolve the promise with the readObject
      })
      .withFailureHandler((error) => {
        reject(error); // Reject the promise if there's an error
      })
      .aiReadDoc();
  });
}
END OF CODE

the right process woudl be
1. click on button to activate aiWrite() 
2. aiWrite() calls aiRead(), which will call the google script function and grab the readObject global object data. Maybe we could store the data in 'slivers' or maybe not, im not sure
3. now our object with copy data gets be passed to createPrompt(). the function checks for the value of "aiMode'
(a) if aiMode is 'rewrite', we don't care about the data stored in readObject because we're grabbing a simple string of text from the ID 'saved-snippet' and passing that to openAI as the 'slivers' variable
(b) if aiMode is 'insert' then we need the info from the object. We pass the data to the createPrompt() function, but only the readUx part of the object. so the 'slivers' we pass should now have a string of text formatted as "something: " and then the text content. And of course we build our custom prompt
4. now we pass both the slivers and the prompt to the openAI function, which writes stuff based on these 2 bits of data

it cant be that hard. Pls help me


-------

no, i need the prepended text to sound exactly like this:

  var prependHeading = ['','h2: ', 'h3: ', 'cta: ', 'eyebrow: ', 'p: ']; 
  var prependHtml = ['','h2','h3','h4','h5','p'];

  need to match heading types to the array indexes in order so
  HEADING1 = ''
  HEADING2 = 'h2'
  ...
  HEDING6 = 'p'

i made arrays so I can reuse the logic, because the formatting will be different for readUx and readHtml.

let's fix the gs to accommodate this


-------

So the output is still malformed. I think this should be somewhat manua because there's no clear pattern in the data.

# readUx out put is:
undefinedEquineApp
undefinedTinder for Horse is here
undefinedMake your breeding program run wild. omg!
undefinedBreed horses
undefinedFind hot horse-cows in your area.
undefinedCLICK ME

should become:

h5: EquineApp
h2: Tinder for Horse is Here
p: Make your breeding program run wild.
h3: Breed horses
p: Find hot horse-cows in your area.
cta: CLICK ME

# readHtml output is:

<undefined>EquineApp</undefined>
<undefined>Tinder for Horse is here</undefined>
<undefined>Make your breeding program run wild. omg!</undefined>
<undefined>Breed horses</undefined>
<undefined>Find hot horse-cows in your area.</undefined>
<undefined>CLICK ME</undefined>

should become

<h5>EquineApp</h5>
<h2>Tinder for Horse is here</h2>
<p>Make your breeding program run wild. omg!</p>
<h3>Breed horses</undefined>
<p>Find hot horse-cows in your area.</p>
<h4>CLICK ME</h4>

so it's just a matter of covering these 6 possible use cases, and the strings to prepend alre already in the array