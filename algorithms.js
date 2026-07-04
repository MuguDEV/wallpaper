const algorithms = [
    {
        id: 'fractal-topography',
        name: 'Fractal Topography',
        description: 'Procedurally generated noise terrain with dynamic contours.',
        popular: true,
        draw: (p, width, height, colors) => {
            p.background(colors[0]);
            p.noStroke();
            let noiseScale = 0.002;
            let layers = 10;

            for (let i = 0; i < layers; i++) {
                p.fill(p.color(colors[(i % (colors.length - 1)) + 1]));
                p.beginShape();
                p.vertex(0, height);
                for (let x = 0; x <= width; x += 10) {
                    let noiseVal = p.noise(x * noiseScale, i * 0.1);
                    let y = p.map(noiseVal, 0, 1, height * 0.2, height);
                    y -= i * (height / (layers * 2));
                    p.vertex(x, y);
                }
                p.vertex(width, height);
                p.endShape(p.CLOSE);
            }
        }
    },
    {
        id: 'liquid-metal',
        name: 'Liquid Metal',
        description: 'Smooth, flowing curves that mimic molten metallic surfaces.',
        popular: false,
        draw: (p, width, height, colors) => {
            p.background(colors[0]);
            p.noStroke();
            let numBlobs = 15;
            for (let i = 0; i < numBlobs; i++) {
                let col = p.color(colors[p.int(p.random(1, colors.length))]);
                col.setAlpha(150);
                p.fill(col);

                let cx = p.random(width);
                let cy = p.random(height);
                let r = p.random(width * 0.1, width * 0.4);

                p.beginShape();
                for (let a = 0; a < p.TWO_PI; a += p.PI / 10) {
                    let xoff = p.map(p.cos(a), -1, 1, 0, 2);
                    let yoff = p.map(p.sin(a), -1, 1, 0, 2);
                    let nr = r + p.map(p.noise(xoff + i, yoff + i), 0, 1, -r * 0.5, r * 0.5);
                    let x = cx + nr * p.cos(a);
                    let y = cy + nr * p.sin(a);
                    p.curveVertex(x, y);
                }
                p.endShape(p.CLOSE);
            }
        }
    },
    {
        id: 'neural-lace',
        name: 'Neural Lace',
        description: 'Interconnected nodes forming a complex, organic web structure.',
        popular: true,
        draw: (p, width, height, colors) => {
            p.background(colors[0]);
            let nodes = [];
            let numNodes = 100;

            for (let i = 0; i < numNodes; i++) {
                nodes.push(p.createVector(p.random(width), p.random(height)));
            }

            p.strokeWeight(2);
            for (let i = 0; i < numNodes; i++) {
                for (let j = i + 1; j < numNodes; j++) {
                    let d = p.dist(nodes[i].x, nodes[i].y, nodes[j].x, nodes[j].y);
                    if (d < width * 0.15) {
                        let col = p.color(colors[p.int(p.random(1, colors.length))]);
                        col.setAlpha(p.map(d, 0, width * 0.15, 255, 0));
                        p.stroke(col);
                        p.line(nodes[i].x, nodes[i].y, nodes[j].x, nodes[j].y);
                    }
                }
            }

            p.noStroke();
            for (let i = 0; i < numNodes; i++) {
                p.fill(colors[p.int(p.random(1, colors.length))]);
                p.circle(nodes[i].x, nodes[i].y, p.random(4, 12));
            }
        }
    },
    {
        id: 'glacial-fracture',
        name: 'Glacial Fracture',
        description: 'Sharp, geometric shards resembling shattering ice structures.',
        popular: false,
        draw: (p, width, height, colors) => {
            p.background(colors[0]);
            let numLines = 50;

            p.strokeWeight(1);
            for (let i = 0; i < numLines; i++) {
                let x1 = p.random(width);
                let y1 = p.random(height);
                let x2 = x1 + p.random(-width * 0.4, width * 0.4);
                let y2 = y1 + p.random(-height * 0.4, height * 0.4);

                let col = p.color(colors[p.int(p.random(1, colors.length))]);
                col.setAlpha(100);
                p.fill(col);
                p.stroke(colors[0]);

                p.beginShape();
                p.vertex(x1, y1);
                p.vertex(x2, y1);
                p.vertex(x2, y2);
                p.vertex(x1, y2);
                p.endShape(p.CLOSE);
            }
        }
    },
    {
        id: 'cosmic-dust',
        name: 'Cosmic Dust',
        description: 'Swirling particle fields mimicking nebulas and stellar formations.',
        popular: true,
        draw: (p, width, height, colors) => {
            p.background(colors[0]);
            p.noStroke();
            let particles = 5000;

            for (let i = 0; i < particles; i++) {
                let x = p.random(width);
                let y = p.random(height);
                let noiseVal = p.noise(x * 0.005, y * 0.005);

                if (noiseVal > 0.4) {
                    let col = p.color(colors[p.int(p.random(1, colors.length))]);
                    col.setAlpha(p.map(noiseVal, 0.4, 1, 50, 255));
                    p.fill(col);
                    p.circle(x, y, p.random(1, 4));
                }
            }
        }
    },
    {
        id: 'ink-wash',
        name: 'Ink Wash',
        description: 'Soft, diffuse watercolor blooms spreading organically.',
        popular: false,
        draw: (p, width, height, colors) => {
            p.background(colors[0]);
            p.noStroke();
            let numDrops = 30;

            for (let i = 0; i < numDrops; i++) {
                let x = p.random(width);
                let y = p.random(height);
                let baseR = p.random(width * 0.05, width * 0.2);
                let col = p.color(colors[p.int(p.random(1, colors.length))]);

                for (let j = 0; j < 5; j++) {
                    col.setAlpha(20);
                    p.fill(col);
                    p.circle(x + p.random(-baseR * 0.1, baseR * 0.1),
                             y + p.random(-baseR * 0.1, baseR * 0.1),
                             baseR * (1 + j * 0.5));
                }
            }
        }
    },
    {
        id: 'quantum-foam',
        name: 'Quantum Foam',
        description: 'Micro-scale fluctuations depicted as vibrant, turbulent bubbles.',
        popular: true,
        draw: (p, width, height, colors) => {
            p.background(colors[0]);
            let gridSize = p.max(width, height) / 30;
            p.noStroke();

            for (let x = 0; x < width; x += gridSize) {
                for (let y = 0; y < height; y += gridSize) {
                    let n = p.noise(x * 0.01, y * 0.01);
                    let s = p.map(n, 0, 1, 0.2, 1.5) * gridSize;
                    let col = p.color(colors[p.int(p.map(n, 0, 1, 1, colors.length - 0.1))]);
                    col.setAlpha(200);
                    p.fill(col);
                    p.circle(x + gridSize/2, y + gridSize/2, s);
                }
            }
        }
    }
];