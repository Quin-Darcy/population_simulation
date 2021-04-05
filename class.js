class Point {
    constructor(id, pid_1, pid_2) {
        // Non-inherited
        this.id = id;
        this.gender = floor(random(2));
        this.age = 0;
        this.death_age = (random() + 0.5) * DEATH_AGE;
        this.kids = [];
        if (this.gender === 0) {
            this.kid_max = floor(random(6)) + 1;
        } else {
            this.kid_max = floor(random(30)) + 1;
        }
        this.pal_size = COMMUNITY_RADIUS;
        this.avg_pal_dist = 0;
        this.neuron = -1;
        this.expecting = false;
        this.mate_id = 0;
        this.r = RADIUS;
        this.exchange_pals = true;

        // Inherited
        this.pid_1 = pid_1;
        this.pid_2 = pid_2;
        this.lineage = [id];
        this.brain = [];
        this.col = [];
        this.pals = [];

        // If not the 0th generation
        if (this.pid_1 != -1 && this.pid_2 != -1) {
            // Position
            if (alive.includes(this.pid_1) && alive.includes(this.pid_2)) {
                this.x = floor((alive[this.pid_1].x + alive[this.pid_2].x) / 2);
                this.y = floor((alive[this.pid_1].y + alive[this.pid_2].y) / 2);
            } else if (alive.includes(this.pid_1) && !alive.includes(this.pid_2)) {
                this.x = alive[this.pid_1].x;
                this.y = alive[this.pid_1].y;
            } else if (!alive.includes(this.pid_1) && alive.includes(this.pid_2)) {
                this.x = alive[this.pid_2].x;
                this.y = alive[this.pid_2].y;
            } else {
                this.x = floor(random(W));
                this.y = floor(random(H));
            }
            // Brain
            for (let i = 0; i < all[this.pid_1].brain.length; i++) {
                this.brain.push((all[this.pid_1].brain[i] + all[this.pid_2].brain[i]) / 2 + random());
            }
            // Color
            for (let i = 0; i < all[this.pid_1].col.length; i++) {
                this.col.push(floor((all[this.pid_1].col[i] + all[this.pid_2].col[i]) / 2));
            }
            // Speed
            let rand = floor(random(2));
            if (rand === 0) {
                this.step = all[this.pid_1].step;
            } else {
                this.step = all[this.pid_2].step;
            }
            // Lineage 
            for (let i = 0; i < all[this.pid_1].lineage.length; i++) {
                this.lineage.push(all[this.pid_1].lineage[i]);
            }
            for (let i = 0; i < all[this.pid_2].lineage.length; i++) {
                if (!this.lineage.includes(all[this.pid_2].lineage[i])) {
                    this.lineage.push(all[this.pid_2].lineage[i]);
                }
            }
            // Pals
            if (this.gender === 0) {
                for (let i = 0; i < all[this.pid_1].pals.length; i++) {
                    if (alive.includes(all[this.pid_1].pals[i])) {
                        this.pals.push(all[this.pid_1].pals[i]);
                    }
                }
                for (let i = 0; i < all[this.pid_2].pals.length; i++) {
                    if (alive.includes(all[this.pid_1].pals[i]) && !this.pals.includes(all[this.pid_2].pals[i])) {
                        this.pals.push(all[this.pid_2].pals[i]);
                    }
                }
            }
        } else {    // For 0th generation. No parents to inherit from.
            // Position
            this.x = floor(random(W));
            this.y = floor(random(H));
            // Brain
            for (let i = 0; i < NEURON_NUM; i++) {
                this.brain.push(random());
            }
            // Color
            for (let i = 0; i < 3; i++) {
                this.col.push(floor(random(255)));
            }
            // Speed
            this.step = floor(random(3)) + 1;
        }
    }
    // Methods
    show() {
        fill(this.col[0], this.col[1], this.col[2]);
        ellipse(this.x, this.y, 2 * this.r);
    }
    update() {
        this.age += 1;

        // Comparison variables
        let old_pal_size = this.pals.length;
        let old_kids = this.kids.length;
        let old_parent_dist = this.parent_dist();
        let old_avg_pal_dist = this.avg_pal_dist;
        let old_death_age = this.death_age;
        let old_so = this.so;

        this.w_choice();
        this.move(this.neuron);

        this.get_pals();
        this.incentives(old_pal_size, old_kids, old_parent_dist, old_avg_pal_dist, old_death_age);
    }
    incentives(old_pal_size, old_kids, old_parent_dist, old_avg_pal_dist, old_death_age, old_so) {
        // Live longer
        if (this.death_age < old_death_age) {
            if (this.brain[this.neuron] - LIFE_PRESERVE > 0) {
                this.brain[this.neuron] -= LIFE_PRESERVE;
            }
        } else if (this.death_age > old_death_age) {
            this.brain[this.neuron] += LIFE_PRESERVE;
        }
        // Grow community
        if (this.pals.length <= old_pal_size) {
            if (this.brain[this.neuron] - GROW_COMMUNITY > 0) {
                this.brain[this.neuron] -= GROW_COMMUNITY;
            }
        } else {
            this.brain[this.neuron] += GROW_COMMUNITY;
            this.death_age += LONELINESS_STRESSOR1;
        }
        // Lonliness
        if (this.pals.length < 1) {
            if (this.brain[this.neuron] - LONELINESS > 0) {
                this.brain[this.neuron] -= LONELINESS;
            }
            if (this.death_age - 1 > 0) {
                this.death_age -= LONELINESS_STRESSOR2;
            }
        }
        // Children
        if (this.kids.length === old_kids && this.kids.length < this.kids_max) {
            if (this.brain[this.neuron] - REPRODUCE > 0) {
                this.brain[this.neuron] -= REPRODUCE;
            }
        } else if (this.kidslength > old_kids && this.kids.length < this.kids_max) {
            this.brain[this.neuron] += REPRODUCE;
            this.death_age += REPRODUCTION_STRSSOR;
        }
        // Decrease distance between you and community members
        if (this.avg_pal_dist < old_avg_pal_dist) {
            this.brain[this.neuron] += COMMUNITY_DISTANCE;
            this.death_age += OVERCROWDING_STRESSOR1;
        } else {
            if (this.brain[this.neuron] - COMMUNITY_DISTANCE > 0) {
                this.brain[this.neuron] -= COMMUNITY_DISTANCE;
            }
            if (this.death_age - OVERCROWDING_STRESSOR2 > 0) {
                this.death_age -= OVERCROWDING_STRESSOR2;
            }
        }
        // Not too close!
        if (this.avg_pal_dist < this.pal_size / 7) {
            if (this.brain[this.neuron] - OVERCROWDING > 0) {
                this.brain[this.neuron] -= OVERCROWDING;
            }
            if (this.death_age - OVERCROWDING_STRESSOR2 > 0) {
                this.death_age -= OVERCROWDING_STRESSOR2;
            }
        }
        
    }
    parent_dist() {
        if (alive.includes(this.pid_1) && alive.includes(this.pid_2)) {
            let P1 = dist(this.x, this.y, alive[this.pid_1].x, alive[this.pid_1].y);
            let P2 = dist(this.x, this.y, alive[this.pid_2].x, alive[this.pid_2].y);
            return (P1 + P2) / 2;
        } else if (alive.includes(this.pid_1) && !alive.includes(this.pid_2)) {
            let P1 = dist(this.x, this.y, alive[this.pid_1].x, alive[this.pid_1].y);
            return P1;
        } else if (!alive.includes(this.pid_1) && alive.includes(this.pid_2)) {
            let P2 = dist(this.x, this.y, alive[this.pid_2].x, alive[this.pid_2].y);
            return P2;
        } else {
            return -1;
        }
    }
    get_pals() {
        let dist = 0;
        let avg = 0;
        for (let i = 0; i < alive.length; i++) {
            dist = this.dist1(this.x, this.y, alive[i].x, alive[i].y);
            if (dist < this.pal_size && this.id != alive[i].id) {
                avg += dist;
                if (!this.pals.includes(i)) {
                    this.pals.push(i);
                    if (this.exchange_pals) {
                        for (let k = 0; k < alive[i].pals.length; k++) {
                            if (!this.pals.includes(alive[i].pals[k])) {
                                this.pals.push(alive[i].pals[k])
                            }
                        }
                    }
                }
                if (dist < this.r + alive[i].r && this.viable_mate(i)) {
                    this.expecting = true;
                    this.mate_id = i;
                }
            }
        }
        this.avg_pal_dist = avg / this.pals.length;
    }
    viable_mate(j) {
        let cond = 0;
        let common = this.lineage.filter(x => alive[j].lineage.includes(x));
        if (common.length === 0) {
            cond += 1;
        }
        if (this.age >= DEATH_AGE / 3 && alive[j].age >= DEATH_AGE / 3) {
            cond += 1;
        } 
        if ((this.gender === 0 && alive[j].gender === 1) || (this.gender === 1 && alive[j].gender === 0)) {
            cond += 1;
        }
        if (this.kids.length < this.kid_max && alive[j].kids.length < alive[j].kid_max) {
            cond += 1;
        }

        if (cond === 4) {
            return true;
        } else {
            return false;
        }
    }
    dist1(x1, y1, x2, y2) {
        let X = Math.pow(x1 - x2, 2);
        let Y = Math.pow(y1 - y2, 2);

        return Math.sqrt(X + Y);
    }
    move(choice) {
        switch(choice) {
            case 0:
                if (this.y + this.step < H - this.r) {
                    this.y += this.step;
                }
                //this.brain[0] += 1;
                break;
            case 1:
                if (this.y - this.step > this.r) {
                    this.y -= this.step;
                }
                //this.brain[0] += 1;
                break;
            case 2:
                if (this.x + this.step < W - this.r) {
                    this.x += this.step;
                }
                //this.brain[2] += 1;
                break;
            case 3:
                if (this.x - this.step > this.r) {
                    this.x -= this.step;
                }
                //this.brain[3] += 1;
                break;
        }
    }
    // Weighted random choice
    w_choice() {
        let sum = 0;
        let rand = 0;
        for (let i = 0; i < NEURON_NUM; i++) {
            sum += this.brain[i];
        }
        rand = random(sum);
        if (0 <= rand && rand <= this.brain[0]) {
            this.neuron = 0;
        } else if (this.brain[0] < rand && rand <= this.brain[0] + this.brain[1]) {
            this.neuron = 1;
        } else if (this.brain[0] + this.brain[1] < rand && rand <= this.brain[0] + this.brain[1] + this.brain[2]) {
            this.neuron = 2;
        } else if (this.brain[0] + this.brain[1] + this.brain[2] < rand && rand <= sum) {
            this.neuron = 3;
        }
    }
}
