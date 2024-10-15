const DATA_SOURCE = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQVEanmT6_1IXNFstVxsplwm9iAGV5SQ7AzlFQce0_9e8YmvGCTt5DGbWMJCmbKOCv2XQZj-sShq2p9/pub?output=csv';

// fetch data from google sheets
fetch(DATA_SOURCE)
  .then(response => response.text())
  .then(text => {
    const data = Papa.parse(text, { header: true }).data;
    console.log(data);
    displayData(data);
});

let iDate = 0;
let iLocale = 0;
let lastLocale = '';
let dateCounter;

function displayData(data) {
    const itinerary = document.querySelector('#itinerary');

    // loop through data and display on page
    data.forEach(row => {
        if (lastLocale != '' && lastLocale != row['Locale']) {
            iLocale++;
        }

        if (iDate == 0) {
            // initialize with 2 columns
            dateCounter = new Date(row['StartDate']);
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
        div.innerHTML = `${row['Locale']}<br>${row['Notes']}`;
        div.style.left = `${((iDate-1) * 230) + 120}px`;
        div.style.top = `${(iLocale * 120)}px`;

        itinerary.appendChild(div);

        // log x and y position of card within page
        console.log(`Locale: ${row['Locale']} | Notes: ${row['Notes']} | x: ${((iDate-1) * 230) + 120}px | y: ${(iLocale * 120)}px`);
        
        // log height of itinerary div
        console.log(itinerary.clientHeight);

        // set html height to the y position of the last card plus its height
        document.querySelector('#background').style.height = `${(iLocale * 120) + 280}px`;
        
        lastLocale = row['Locale'];
        iDate++;
    });
}

function createColumn(date) {
    const background = document.querySelector('#background');
    const bgColumn = document.createElement('div');

    let formattedDate = date.toLocaleString('en-US', { month: 'short', day: 'numeric' });

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
