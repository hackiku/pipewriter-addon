

function logSlivers() {

  const sliversTest = document.getElementById('saved-text').innerHTML;
  console.log('slivers innerHTML: ' + sliversTest);

}

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

function createPrompt() {

  const mainPrompt = document.querySelector("#roleplay-prompt")

    // Get prompts
  const roleplayElement = document.querySelector("#roleplay-prompt");
  const rewriteElement = document.querySelector("#rewrite-prompt");
  const insertElement = document.querySelector("#insert-prompt");

  // Get content of the prompts
  const roleplay = roleplayElement.innerText;
  const rewrite = rewriteElement.innerText;
  const insert = insertElement.innerText;

  // Combine prompt contents
  const combinedPrompt = `${roleplay} ${rewrite} ${insert}`;

  // TODO rewrite/insert logic
  
  // Display combined prompt in the UI
  const logPrompt = document.querySelector("#log-prompt");
  logPrompt.innerHTML = combinedPrompt;

  return { roleplay, rewrite, insert, combinedPrompt };
}


async function aiWriter() {

    const completionElement = document.getElementById('completion');
    // Start animation
    completionElement.classList.add('pulsing');

    const snippet = document.getElementById('saved-text').innerText;

    const prompts = createPrompt();
    
    const promptMessage =
    `${prompts.roleplay}. ${prompts.rewrite}. Here are the slivers of copy: ${snippet};
    `
    // `${combinedPrompt}. Rewrite the following slivers of website UX copy: ${snippet}`;
  
    const data = {
      model: 'gpt-3.5-turbo',
      temperature: 0,
      max_tokens: 350,
      messages: [
        {
          role: 'user',  
          content: promptMessage,
        },
      ],
    };
  

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify(data),
      });
  
      if (response.ok) {
        const completionData = await response.json();

        console.log("OpenAI API Response:", completionData);

        console.log(completionData.choices[0].message.content);
        // document.getElementById('saved-text').innerHTML = completionData.choices[0].message.content;
        document.getElementById('completion').innerText = completionData.choices[0].message.content;
        console.log('completionData is :' + JSON.stringify(completionData));

      } else {
        throw new Error(`Error with OpenAI API request: ${response.statusText}`);
      }
    } catch (error) {
      console.error(`Error with OpenAI API request: ${error.message}`);
    } finally {
      // stop writing animation
      completionElement.classList.remove('pulsing');
    }
  }


document.addEventListener('DOMContentLoaded', (event) => {
    // This function will run once the page is ready
    document.getElementById('ai-writer').addEventListener('click', aiWriter);
});

/* 
 _   _ _   _ _ __(_)
| | | | | | | '__| |
| |_| | |_| | |  | |
 \__, |\__,_|_|  |_|
 |___/                */