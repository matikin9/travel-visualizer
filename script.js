const DATA_SOURCE_STAYS = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQVEanmT6_1IXNFstVxsplwm9iAGV5SQ7AzlFQce0_9e8YmvGCTt5DGbWMJCmbKOCv2XQZj-sShq2p9/pub?gid=0&single=true&output=csv';
const DATA_SOURCE_ACTIVITES = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQVEanmT6_1IXNFstVxsplwm9iAGV5SQ7AzlFQce0_9e8YmvGCTt5DGbWMJCmbKOCv2XQZj-sShq2p9/pub?gid=69921073&single=true&output=csv';

// fetch data from multiple data sources
// Promise.all([
//     fetch(DATA_SOURCE_STAYS).then(response => response.text()),
//     fetch(DATA_SOURCE_ACTIVITES).then(response => response.text())
// ])

async function getData(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) {
        throw new Error(`Response status: ${response.status}`);
        }

        const data = await response.text();
        console.log(data);
        
        return data;
    } catch (error) {
        console.error(error.message);
    }
}

Promise.all([getData(DATA_SOURCE_STAYS), getData(DATA_SOURCE_ACTIVITES)])
    .then(results => {
        let stays = results[0];
        let activities = results[1];

        let stayData = Papa.parse(stays, { header: true }).data;
        let activityData = Papa.parse(activities, { header: true }).data;

        displayData(stayData, activityData);
    })
    .catch(err => console.error(err));

let iDate = 0;
let iLocale = 0;
let lastLocale = '';
let dateCounter;

function displayData(stayData, activityData) {
    const itinerary = document.querySelector('#itinerary');

    // loop through data and display on page
    stayData.forEach(stayRow => {
        if (lastLocale != '' && lastLocale != stayRow['Locale']) {
            iLocale++;
        }

        if (iDate == 0) {
            // initialize with 2 columns
            dateCounter = new Date(stayRow['Date']);
            createColumn(dateCounter);
            
            iDate++;
            dateCounter.setDate(dateCounter.getDate() + 1);
            createColumn(dateCounter);
        } else {
            dateCounter.setDate(dateCounter.getDate() + 1);
            createColumn(dateCounter);
        }
    
        const div = document.createElement('div');
        div.classList.add('card');
        div.innerHTML = `<strong>${stayRow['Locale']}</strong><br>${stayRow['Stay']}<br>${stayRow['Notes']}`;
        div.style.left = `${((iDate-1) * 230) + 120}px`;
        div.style.top = `${(iLocale * 120)}px`;

        const divChild = document.createElement('div');
        divChild.classList.add('card-activities');
        
        // loop through activities and display on page
        activityData.forEach(activityRow => {
            if (activityRow['Date'] == stayRow['Date']) {
                divChild.innerHTML += `${activityRow['Activity']}<br>`;
            }
        });

        let divchildHeight = divChild.clientHeight;
        div.appendChild(divChild);

        itinerary.appendChild(div);

        // set html height to the y position of the last card plus its height
        document.querySelector('#background').style.height = `${(iLocale * 120) + 280 + divchildHeight + 40}px`;
        
        lastLocale = stayRow['Locale'];
        iDate++;
    });
}

function createColumn(date) {
    const background = document.querySelector('#background');
    const bgColumn = document.createElement('div');
    const dayOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    let formattedDate = dayOfWeek[date.getDay()] + ', ' +  (date.getMonth() + 1) + '/' + date.getDate();

    bgColumn.classList.add('bg-column');
    bgColumn.style.left = `${iDate * 230}px`;
    bgColumn.innerHTML = `<h1>${formattedDate}</h1>`;
    
    let r = 0 + iDate*8;
    let g = 255 - iDate*8;
    let b = 255 - iDate*5;
    
    bgColumn.style.backgroundColor = `rgb(${r}, ${g}, ${b})`;

    background.appendChild(bgColumn);
}

// add event listener for a click and drag event and translate it to vertical and horizontal scrolling
let isDragging = false;
let lastX = 0;
let lastY = 0;
document.addEventListener('mousedown', function(event) {
    isDragging = true;
    lastX = event.clientX;
    lastY = event.clientY;
    // change cursor to grabbing
    document.body.style.cursor = 'grabbing';
});
document.addEventListener('mouseup', function(event) {
    isDragging = false;
    // change cursor back to normal
    document.body.style.cursor = 'default';
});
document.addEventListener('mousemove', function(event) {
    if (isDragging) {
        window.scroll(window.scrollX + (lastX - event.clientX), window.scrollY + (lastY - event.clientY));
        lastX = event.clientX;
        lastY = event.clientY;
    }
});
