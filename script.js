// Constants
let W = window.innerWidth;
let H = window.innerHeight;
let P = 80;     // Initial population size
let FPS = 60;
let YEARS_ALIVE = 35;
let SECONDS_PER_YEAR = 2;
let DEATH_AGE = (SECONDS_PER_YEAR * FPS) * YEARS_ALIVE;
let NEURON_NUM = 4;

let RADIUS = 0.5;
let COMMUNITY_RADIUS = 300;
let LIFE_PRESERVE = 5;
let GROW_COMMUNITY = 3;
let LONELINESS_STRESSOR1 = 1;
let LONELINESS_STRESSOR2 = 1;
let LONELINESS = 2;
let REPRODUCE = 3;
let REPRODUCTION_STRESSOR = 1;
let COMMUNITY_DISTANCE = 3;
let OVERCROWDING = 1;
let OVERCROWDING_STRESSOR1 = 1;
let OVERCROWDING_STRESSOR2 = 1;

// Arrays
let all = [];
let alive = [];
let dead = [];
let born = [];

function setup() {
    createCanvas(W, H);
    frameRate(FPS);
    background(255);

    for (let i = 0; i < P; i++) {
        alive.push(new Point(i, -1, -1));
    }
    for (let i = 0; i < P; i++) {
        all.push(alive[i]);
    }
}

function draw() {
    if (alive.length === 0) {
        background(255);
    }
    for (let i = 0; i < alive.length; i++) {
        alive[i].show();
        alive[i].update();

        if (alive[i].expecting && !born.includes([i, alive[i].mate_id]) && !born.includes([alive[i].mate_id, i])) {
            born.push([i, alive[i].mate_id]);
        }
        if (alive[i].age >= alive[i].death_age && !dead.includes(i)) {
            dead.push(i);
        }
    }
    for (let i = 0; i < born.length; i++) {
        alive.push(new Point(alive.length, born[i][0], born[i][1]));
        
        alive[born[i][0]].kids.push(alive.length - 1);
        alive[born[i][1]].kids.push(alive.length - 1);
        
        alive[born[i][0]].expecting = false;
        alive[born[i][1]].expecting = false;
    }
    for (let i = 0; i < alive.length; i++) {
        if (!all.includes(alive[i])) {
            all.push(alive[i]);
        }
    }
    born = [];
    
    for (let i = 0; i < dead.length; i++) {
        alive.splice(dead[i], 1);
    }
    dead = [];
}

function reset() {
    W = window.innerWidth;
    H = window.innerHeight;

    createCanvas(W, H);
    background(255);

    alive = [];
    all = [];

    for (let i = 0; i < P; i++) {
        alive.push(new Point(i, -1, -1));
    }
    for (let i = 0; i < P; i++) {
        all.push(alive[i]);
    }
}

//Events
window.addEventListener("resize", onResize);

function onResize() {
    const width = window.innerWidth;
    const height = window.innerHeight;

    createCanvas(width, height);
}

window.addEventListener('load', () => {
    document.getElementById('reset-button').addEventListener('click', () => {
        reset();
    });

    document.getElementById('stop').addEventListener('click', () => {
        noLoop();
    });

    document.getElementById('start').addEventListener('click', () => {
        loop();
    });

    document.getElementById('pop').addEventListener('change', event => {
        P = parseFloat(event.target.value);
    });
    document.getElementById('radius').addEventListener('change', event => {
        RADIUS = parseFloat(event.target.value);
    });
    document.getElementById('age').addEventListener('change', event => {
        YEARS_ALIVE = parseFloat(event.target.value);
    });
    document.getElementById('comm-rad').addEventListener('change', event => {
        COMMUNITY_RADIUS = parseFloat(event.target.value);
    });
    document.getElementById('life-pres').addEventListener('change', event => {
        LIFE_PRESERVE = parseFloat(event.target.value);
    });
    document.getElementById('grow-comm').addEventListener('change', event => {
        GROW_COMMUNITY = parseFloat(event.target.value);
    });
    document.getElementById('lone').addEventListener('change', event => {
        LONELINESS = parseFloat(event.target.value);
    });
    document.getElementById('lone-stress1').addEventListener('change', event => {
        LONELINESS_STRESSOR1 = parseFloat(event.target.value);
    });
    document.getElementById('lone-stress2').addEventListener('change', event => {
        LONELINESS_STRESSOR2 = parseFloat(event.target.value);
    });
    document.getElementById('repo').addEventListener('change', event => {
        REPRODUCE = parseFloat(event.target.value);
    });
    document.getElementById('repo-stress1').addEventListener('change', event => {
        REPRODUCTION_STRESSOR1 = parseFloat(event.target.value);
    });
    document.getElementById('repo-stress2').addEventListener('change', event => {
        REPODUCTION_STRESSOR2 = parseFloat(event.target.value);
    });
    document.getElementById('comm-dist').addEventListener('change', event => {
        COMMUNITY_DISTANCE = parseFloat(event.target.value);
    });
    document.getElementById('overcrowd').addEventListener('change', event => {
        OVERCROWDING = parseFloat(event.target.value);
    });
    document.getElementById('overcrowd-stress1').addEventListener('change', event => {
        OVERCROWDING_STRESSOR1 = parseFloat(event.target.value);
    });
    document.getElementById('overcrowd-stress2').addEventListener('change', event => {
        OVERCROWDING_STRESSOR2 = parseFloat(event.target.value);
    });
});


