const ALGORITHMS = [
    {
        id: 'fractalTopography',
        name: 'Fractal Topography',
        category: 'Landscapes',
        description: 'Layered noise creating mountainous landscapes.',
        popular: true,
        draw: (p, colors, width, height) => {
            p.background(p.color(colors[0]));
            p.noStroke();
            let yoff = 0;
            for (let y = height * 0.2; y < height; y += height * 0.05) {
                let fillCol = p.color(colors[Math.floor(p.random(1, colors.length))]);
                fillCol.setAlpha(200);
                p.fill(fillCol);
                p.beginShape();
                p.vertex(0, height);
                let xoff = 0;
                for (let x = 0; x <= width; x += width * 0.05) {
                    let mapY = p.map(p.noise(xoff, yoff), 0, 1, -height * 0.2, height * 0.2);
                    p.vertex(x, y + mapY);
                    xoff += 0.1;
                }
                p.vertex(width, height);
                p.endShape(p.CLOSE);
                yoff += 0.2;
            }
        }
    },
    {
        id: 'liquidMetal',
        name: 'Liquid Metal',
        category: 'Abstract',
        description: 'Smooth, flowing curves resembling molten material.',
        popular: false,
        draw: (p, colors, width, height) => {
            p.background(p.color(colors[0]));
            p.noFill();
            for (let i = 0; i < 150; i++) {
                let strokeCol = p.color(colors[p.floor(p.random(1, colors.length))]);
                strokeCol.setAlpha(150);
                p.stroke(strokeCol);
                p.strokeWeight(p.random(1, 5));
                p.beginShape();
                for (let j = 0; j < 5; j++) {
                    let x = p.noise(i * 0.1, j * 0.5, p.millis() * 0.0001) * width;
                    let y = p.noise(j * 0.5, i * 0.1, p.millis() * 0.0001) * height;
                    p.curveVertex(x, y);
                }
                p.endShape();
            }
        }
    },
    {
        id: 'neuralLace',
        name: 'Neural Lace',
        category: 'Tech',
        description: 'Interconnected nodes forming a complex web.',
        popular: true,
        draw: (p, colors, width, height) => {
            p.background(p.color(colors[0]));
            const nodes = [];
            const numNodes = 100;
            for (let i = 0; i < numNodes; i++) {
                nodes.push({
                    x: p.random(width),
                    y: p.random(height),
                    color: p.color(colors[p.floor(p.random(1, colors.length))])
                });
            }

            for (let i = 0; i < nodes.length; i++) {
                for (let j = i + 1; j < nodes.length; j++) {
                    let d = p.dist(nodes[i].x, nodes[i].y, nodes[j].x, nodes[j].y);
                    if (d < width * 0.15) {
                        let strokeCol = p.lerpColor(nodes[i].color, nodes[j].color, 0.5);
                        strokeCol.setAlpha(p.map(d, 0, width * 0.15, 255, 0));
                        p.stroke(strokeCol);
                        p.strokeWeight(1);
                        p.line(nodes[i].x, nodes[i].y, nodes[j].x, nodes[j].y);
                    }
                }
                p.noStroke();
                p.fill(nodes[i].color);
                p.circle(nodes[i].x, nodes[i].y, p.random(3, 8));
            }
        }
    },
    {
        id: 'glacialFracture',
        name: 'Glacial Fracture',
        category: 'Geometric',
        description: 'Sharp, angular shards and crystalline structures.',
        popular: false,
        draw: (p, colors, width, height) => {
            p.background(p.color(colors[0]));
            for (let i = 0; i < 50; i++) {
                p.fill(p.color(colors[p.floor(p.random(1, colors.length))]));
                p.noStroke();
                p.beginShape();
                let startX = p.random(width);
                let startY = p.random(height);
                p.vertex(startX, startY);
                for(let j=0; j<4; j++) {
                    p.vertex(startX + p.random(-width*0.2, width*0.2), startY + p.random(-height*0.2, height*0.2));
                }
                p.endShape(p.CLOSE);
            }
        }
    },
    {
        id: 'cosmicDust',
        name: 'Cosmic Dust',
        category: 'Space',
        description: 'Scattered particles creating a nebulous starfield.',
        popular: false,
        draw: (p, colors, width, height) => {
            p.background(p.color(colors[0]));
            p.noStroke();
            for (let i = 0; i < 2000; i++) {
                let x = p.random(width);
                let y = p.random(height);
                let r = p.random(0.5, 3);
                let col = p.color(colors[p.floor(p.random(1, colors.length))]);
                col.setAlpha(p.random(50, 255));
                p.fill(col);
                p.circle(x, y, r);
            }

            // Add some "glowing" nebulous areas
            for(let i=0; i<5; i++) {
                let x = p.random(width);
                let y = p.random(height);
                let col = p.color(colors[p.floor(p.random(1, colors.length))]);
                for(let r=width*0.5; r>0; r-=width*0.05) {
                    col.setAlpha(p.map(r, width*0.5, 0, 0, 50));
                    p.fill(col);
                    p.circle(x, y, r);
                }
            }
        }
    },
    {
        id: 'inkWash',
        name: 'Ink Wash',
        category: 'Artistic',
        description: 'Soft, overlapping watercolor-like brush strokes.',
        popular: false,
        draw: (p, colors, width, height) => {
            p.background(p.color(colors[0]));
            p.noStroke();
            for(let i=0; i<100; i++) {
                let x = p.random(width);
                let y = p.random(height);
                let col = p.color(colors[p.floor(p.random(1, colors.length))]);
                let r = p.random(width*0.05, width*0.3);

                for(let j=0; j<10; j++) {
                    let offsetX = p.random(-r*0.2, r*0.2);
                    let offsetY = p.random(-r*0.2, r*0.2);
                    col.setAlpha(p.random(5, 20));
                    p.fill(col);
                    p.circle(x + offsetX, y + offsetY, r * p.random(0.8, 1.2));
                }
            }
        }
    },
    {
        id: 'quantumFoam',
        name: 'Quantum Foam',
        category: 'Abstract',
        description: 'Bubbling, effervescent spherical overlapping structures.',
        popular: true,
        draw: (p, colors, width, height) => {
            p.background(p.color(colors[0]));
            for (let i = 0; i < 300; i++) {
                let x = p.random(width);
                let y = p.random(height);
                let r = p.random(width * 0.01, width * 0.15);
                let col1 = p.color(colors[p.floor(p.random(1, colors.length))]);
                let col2 = p.color(colors[p.floor(p.random(1, colors.length))]);

                let gradient = p.drawingContext.createRadialGradient(x, y, 0, x, y, r);
                gradient.addColorStop(0, col1.toString());
                gradient.addColorStop(1, p.color(0,0,0,0).toString());

                p.drawingContext.fillStyle = gradient;
                p.noStroke();
                p.circle(x, y, r * 2);
            }
        }
    }
];
