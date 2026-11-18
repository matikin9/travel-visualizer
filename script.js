// const DATA_SOURCE_STAYS = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQVEanmT6_1IXNFstVxsplwm9iAGV5SQ7AzlFQce0_9e8YmvGCTt5DGbWMJCmbKOCv2XQZj-sShq2p9/pub?gid=0&single=true&output=csv';
// const DATA_SOURCE_ACTIVITES = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQVEanmT6_1IXNFstVxsplwm9iAGV5SQ7AzlFQce0_9e8YmvGCTt5DGbWMJCmbKOCv2XQZj-sShq2p9/pub?gid=69921073&single=true&output=csv';

const DATA_SOURCE_STAYS = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSxpfABmLz9REn8sR852mXTl115o5H46QNQgG0kQg89q7leohr6oAWDtv_sIuOj_gYwM6ueXlOM5I5a/pub?gid=0&single=true&output=csv';
const DATA_SOURCE_ACTIVITES ='https://docs.google.com/spreadsheets/d/e/2PACX-1vSxpfABmLz9REn8sR852mXTl115o5H46QNQgG0kQg89q7leohr6oAWDtv_sIuOj_gYwM6ueXlOM5I5a/pub?gid=69921073&single=true&output=csv';

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

function setBackgroundHeight(requiredHeight) {
    const docHeight = Math.max(
        document.body.scrollHeight,
        document.documentElement.scrollHeight,
        document.body.offsetHeight,
        document.documentElement.offsetHeight,
        document.documentElement.clientHeight
    );

    const finalHeight = Math.max(requiredHeight, docHeight, window.innerHeight);
    document.querySelector('#background').style.height = `${finalHeight}px`;
}

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

        div.innerHTML = `<strong>${stayRow['Locale']}</strong><br>`;

        let link = document.createElement('a');
        if (stayRow['Link'] != '') {
            link.href = stayRow['Link'];
            link.target = '_blank';
            link.innerHTML = stayRow['Stay'];
            div.appendChild(link);
        } else {
            div.innerHTML += stayRow['Stay'];
        }

        div.innerHTML += `<br>${stayRow['Notes']}`;
        div.style.left = `${((iDate-1) * 230) + 120}px`;
        div.style.top = `${(iLocale * 120)}px`;

        const divChild = document.createElement('div');
        divChild.classList.add('card-activities');
        
        // loop through activities and display on page
        activityData.forEach(activityRow => {
            if (activityRow['Date'] == stayRow['Date']) {
                let activity = document.createElement('div');
                activity.classList.add('activity');

                if (activityRow['Link'] != '') {
                    let link = document.createElement('a');
                    link.href = activityRow['Link'];
                    link.target = '_blank';
                    link.innerHTML = activityRow['Activity'];
                    activity.appendChild(link);
                } else {
                    activity.innerHTML = activityRow['Activity'];
                }

                activity.innerHTML += '<br>';
                divChild.appendChild(activity);
            }
        });

        let divchildHeight = divChild.clientHeight;

        if (divChild.children.length > 0) {
            div.appendChild(divChild);
        }

        itinerary.appendChild(div);

        // Ensure the background always covers the full page height.
        setBackgroundHeight((iLocale * 120) + 280 + divchildHeight + 40);
        
        lastLocale = stayRow['Locale'];
        iDate++;
    });
}

window.addEventListener('resize', function() {
    setBackgroundHeight(document.documentElement.scrollHeight);
});

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

// drag-to-pan with iOS-safe behavior: only start drag after threshold, preserve taps/clicks
const DRAG_THRESHOLD = 6;
let isPointerDown = false;
let isDragging = false;
let didDrag = false;
let activePointerId = null;
let startX = 0;
let startY = 0;
let lastX = 0;
let lastY = 0;

function isInteractiveElement(target) {
    return !!target.closest('a, button, input, textarea, select, label');
}

function beginPointerTrack(pointerId, x, y) {
    isPointerDown = true;
    isDragging = false;
    didDrag = false;
    activePointerId = pointerId;
    startX = x;
    startY = y;
    lastX = x;
    lastY = y;
}

function stopDragging() {
    isPointerDown = false;
    isDragging = false;
    activePointerId = null;
    document.body.classList.remove('is-dragging');
}

function handlePanMove(x, y) {
    if (!isPointerDown) {
        return false;
    }

    const movedX = x - startX;
    const movedY = y - startY;

    if (!isDragging && (Math.abs(movedX) >= DRAG_THRESHOLD || Math.abs(movedY) >= DRAG_THRESHOLD)) {
        isDragging = true;
        document.body.classList.add('is-dragging');
    }

    if (!isDragging) {
        return false;
    }

    const deltaX = lastX - x;
    const deltaY = lastY - y;
    window.scrollBy(deltaX, deltaY);
    lastX = x;
    lastY = y;
    didDrag = true;

    return true;
}

if ('PointerEvent' in window) {
    document.addEventListener('pointerdown', function(event) {
        if (!event.isPrimary || event.button !== 0) {
            return;
        }

        if (isInteractiveElement(event.target)) {
            return;
        }

        beginPointerTrack(event.pointerId, event.clientX, event.clientY);

        if (document.body.setPointerCapture) {
            document.body.setPointerCapture(event.pointerId);
        }
    });

    document.addEventListener('pointermove', function(event) {
        if (event.pointerId !== activePointerId) {
            return;
        }

        if (handlePanMove(event.clientX, event.clientY)) {
            event.preventDefault();
        }
    }, { passive: false });

    document.addEventListener('pointerup', function(event) {
        if (event.pointerId === activePointerId) {
            stopDragging();
        }
    });

    document.addEventListener('pointercancel', function(event) {
        if (event.pointerId === activePointerId) {
            stopDragging();
        }
    });
} else {
    // Fallback for older iOS Safari versions without Pointer Events.
    document.addEventListener('touchstart', function(event) {
        if (event.touches.length !== 1) {
            return;
        }

        if (isInteractiveElement(event.target)) {
            return;
        }

        const touch = event.touches[0];
        beginPointerTrack('touch', touch.clientX, touch.clientY);
    }, { passive: true });

    document.addEventListener('touchmove', function(event) {
        if (activePointerId !== 'touch' || event.touches.length !== 1) {
            return;
        }

        const touch = event.touches[0];
        if (handlePanMove(touch.clientX, touch.clientY)) {
            event.preventDefault();
        }
    }, { passive: false });

    document.addEventListener('touchend', function() {
        if (activePointerId === 'touch') {
            stopDragging();
        }
    });

    document.addEventListener('touchcancel', function() {
        if (activePointerId === 'touch') {
            stopDragging();
        }
    });

    document.addEventListener('mousedown', function(event) {
        if (event.button !== 0 || isInteractiveElement(event.target)) {
            return;
        }

        beginPointerTrack('mouse', event.clientX, event.clientY);
    });

    document.addEventListener('mousemove', function(event) {
        if (activePointerId !== 'mouse') {
            return;
        }

        handlePanMove(event.clientX, event.clientY);
    });

    document.addEventListener('mouseup', function() {
        if (activePointerId === 'mouse') {
            stopDragging();
        }
    });
}

window.addEventListener('blur', stopDragging);
document.addEventListener('mouseleave', stopDragging);

// Prevent accidental link activation immediately after a pan gesture.
document.addEventListener('click', function(event) {
    if (didDrag) {
        event.preventDefault();
        event.stopPropagation();
        didDrag = false;
    }
}, true);
