<script>

    let aiMode = 'insert'; // hardcoded, change soon
    
    let uiElementsHistory = {};  // declare a global object to store the history
    
    let aiUiElementMap = {
      'zz-right': {
        description: 'zigzag section with one image and text to the right',
      },
      'blurbs-3': {
        description: 'three blurbs with 3x titles and a short description for each title',
      },
    };
    
    let currentUIElementId; // Declare currentUIElementId as a global variable
    
    function insertElement(id) {
      currentUIElementId = id; // Set the global variable to the id of the element that's being inserted
      google.script.run
      .withSuccessHandler(function(uiElements) {
          console.log('object log from JS: ', uiElements);
          // Store the complete uiElements object in history
          uiElementsHistory[id] = uiElements;
          console.log('history stringify: ', JSON.stringify(uiElementsHistory));
          console.log('textContent history: ', uiElementsHistory[id].textContent);
      })
      .withFailureHandler(function(error) {
          console.error('Error occurred: ', error);
      })
      .getElement(id);
    }
    
    // document.addEventListener('DOMContentLoaded', (event) => {
    
    let readObject = {}; // Declare readObject as a global variable
    let slivers = ""; // Declare slivers as a global variable
    
    function aiRead() {
      return new Promise((resolve, reject) => {
        google.script.run
          .withSuccessHandler((result) => {
            readObject = result; // Update the global variable with the result from the server
            document.getElementById('readText').innerText = readObject.readText;
            document.getElementById('readUx').innerText = readObject.readUx;
            document.getElementById('readHtml').innerText = readObject.readHtml;
    
            /////// readUx only
            slivers = readObject.readUx;
            console.log('slivers: ' + slivers);
            
            resolve(readObject); // Resolve the promise with the readObject
          })
          .withFailureHandler((error) => {
            reject(error); // Reject the promise if there's an error
          })
          .aiReadDoc();
      });
    }
    
    
    function clearRead() {
      document.getElementById('readText').innerText = "Text";
      document.getElementById('readUx').innerText = "h2: Level";
      document.getElementById('readHtml').innerText = "<h2>HTML</h2>";
    
      readObject = {};
    }
    
    // ------------------
    
    // collapse section titles
    
    const titles = document.querySelectorAll('.title');
    const sections = document.querySelectorAll('.app-section');
    
    titles.forEach(function(title, index) {
      title.addEventListener('click', function() {
        sections.forEach(function(section, sectionIndex) {
          if (sectionIndex === index) {
            section.classList.toggle('collapsed');
          } else {
            section.classList.add('collapsed');
          }
        });
      });
    });
    
    
    
      // tabs for wireframe elements and prompts
    
    function initializeTabs(tabSelector, contentSelector) {
      const tabs = document.querySelectorAll(tabSelector);
      const contentDivs = document.querySelectorAll(contentSelector);
    
      // Hide all content divs except the one corresponding to the selected tab
      contentDivs.forEach((div, index) => {
        if (tabs[index].classList.contains('selected')) {
          div.style.display = 'block';
        } else {
          div.style.display = 'none';
        }
      });
    
      // Add click event listener to each tab
      tabs.forEach((tab, index) => {
        tab.addEventListener('click', () => {
          // Remove 'selected' class from all tabs and hide content divs
          tabs.forEach((tab) => tab.classList.remove('selected'));
          contentDivs.forEach((div) => (div.style.display = 'none'));
    
          // Add 'selected' class to clicked tab and show corresponding content div
          tab.classList.add('selected');
          contentDivs[index].style.display = 'block';
        });
      });
    }
    
    initializeTabs('.design-tabs .tab', '.design-tabs-container > div');
    initializeTabs('.prompt-tabs .tab', '.prompt-tabs-container > div');
    
    
    /*                        _    ___ 
     ___  _ __   ___ _ __    / \  |_ _|
    / _ \| '_ \ / _ \ '_ \  / _ \  | | 
     (_) | |_) |  __/ | | |/ ___ \ | | 
    \___/| .__/ \___|_| |_/_/   \_\___|
         |_|                           */
    
    
      const apiKey = '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';
    
      async function createPrompt() {
    
        const roleplay = document.querySelector("#roleplay-prompt").innerText;
        const rewrite = document.querySelector("#rewrite-prompt").innerText;
        const insert = document.querySelector("#insert-prompt").innerText;
        const wireframe = 'Write website copy for the provided template-based UI elements keeping their exact structure, format, and recommended word counts.'; // hand coded for now
    
        // let slivers = "";
        let prompt = "";
    
        if (aiMode === 'rewrite') {
    
          slivers = document.getElementById('saved-text').innerText;
          prompt = `${roleplay} ${rewrite}. Rewrite the following slivers of copy: ${slivers}`;
        } else if (aiMode === 'insert') {
          // slivers = JSON.stringify(readObject.readUx); 
          prompt = `${roleplay} ${insert}. Write the new section copy to fit neatly after all previous sections of the page: ${slivers}`;
        } else if (aiMode === 'wireframe') {
          // need to pass the id that's being inserted with UI
          let uiElement = aiUiElementMap[currentUIElementId];
          slivers = uiElementsHistory[currentUIElementId].textContent; 
          prompt = `${roleplay} ${wireframe} Write this UI element: ${uiElement.description}, and replace the placeholder text: ${slivers}`;
        }
    
        // document.getElementById('prompt-log').innerText = prompt;
        return prompt;
      }
    
    async function aiWrite() {
    
      const loading = document.getElementById('completion');
      // Start animation
      loading.classList.add('pulsing');
    
      try {
    
        if (aiMode !== 'wireframe') {
          await aiRead(); // We only call aiRead() when we're not in 'wireframe' mode
        }
    
        const prompt = await createPrompt();
        // Log the text content to the console
        console.log('ASDDD Text content for current UI element: ', uiElementsHistory[currentUIElementId].textContent);
    
        // Prepare the data for the OpenAI API
        const data = {
          model: 'gpt-3.5-turbo',
          temperature: 0,
          max_tokens: 350,
          messages: [
            {
              role: 'user',  
              content: prompt,
            },
          ],
        };
    
        // Make the request to the OpenAI API
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify(data),
        });
    
    
        // If the response is not ok, throw an error
        if (!response.ok) {
          throw new Error(`Error with OpenAI API request: ${response.statusText}`);
        }
    
        // If the response is ok, process it
        const completionData = await response.json();
    
        document.getElementById('completion').innerText = completionData.choices[0].message.content;
        
      } catch (error) {
        // If there's an error (either in aiRead() or in the fetch request), log it
        console.error(`Error: ${error.message}`);
      } finally {
        loading.classList.remove('pulsing');
      }
    }
    
    // button event listeners
    
    document.addEventListener('DOMContentLoaded', (event) => {
      document.getElementById('ai-write-btn').addEventListener('click', aiWrite);
      // make unclickable if no cursor selected ?
      document.getElementById('ai-read-btn').addEventListener('click', aiRead);
      document.getElementById('clear-read').addEventListener('click', clearRead);
      document.getElementById('create-prompt-btn').addEventListener('click', createPrompt);
      document.getElementById('deleteColumnButton').addEventListener('click', function() {
        google.script.run.deleteColumnWithCursor();
      });
    
    });
    
    /* _   _ _   _ _ __(_)
      | | | | | | | '__| |
      | |_| | |_| | |  | |
      \__, |\__,_|_|  |_|
      |___/                */
    
    
    
    let aiWireframingMode = false;
    
    function toggleAIWireframingMode() {
      aiWireframingMode = !aiWireframingMode;
    
      // Get all the <a> elements inside .dropper
      const dropperLinks = document.querySelectorAll('.dropper a');
    
      dropperLinks.forEach(link => {
        if (aiWireframingMode) {
          // If AI Wireframing Mode is on, set opacity to 0.5
          link.style.opacity = 0.5;
        } else {
          // If AI Wireframing Mode is off, set opacity back to 1
          link.style.opacity = 1;
        }
      });
    }
    
    // AI wireframing function
    
    async function aiWireframeElement(id) {
      // Start by calling your insertElement function. This will fetch the element and update uiElementsHistory
      await insertElement(id);
    
      // Next, call aiWrite() to get the AI generated text
      await aiWrite();
    
      // Now the completion from the AI should be available in 'completion'
      const aiCompletion = document.getElementById('completion').innerText;
    
      // Replace the placeholder text in the element in uiElementsHistory
      uiElementsHistory[id].textContent = aiCompletion;
    
      // Insert the updated element into the wireframe
      // (You'll need to write this function. It should remove the old element if it's already there, and insert the updated one.)
      insertUpdatedElement(id);
    }
    
    // Update the event listener for the insert element buttons/links
    document.querySelectorAll('.insert-element-btn').forEach(btn => {
      btn.addEventListener('click', (event) => {
        event.preventDefault();  // Prevent the default click action
        if (aiWireframingMode) {
          // If we're in AI Wireframing mode, use the new function
          aiWireframeElement(btn.dataset.id);  // Assuming 'btn.dataset.id' is how you get the id of the element to be inserted
        } else {
          // If not, use the regular function
          insertElement(btn.dataset.id);
        }
      });
    });
    
    
</script>