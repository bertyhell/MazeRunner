var imageDataBackup;
var MAX = 1000000;
var COLOR_MARGIN = 80;

self.addEventListener('message', function (e) {
    var imageData = e.data.imageData;
    var width = e.data.imageData.width;
    var height = e.data.imageData.height;
    var start = e.data.start;
    var stop = e.data.stop;

    imageDataBackup = new Uint8ClampedArray(imageData.data);

    var visitedLocations = [];
    var nextNeighbors = [];
    nextNeighbors[start[0] + "," + start[1]] = 0;
    var numberOfNeighbors = 1;

    var counter = 0;

    while (counter < MAX && numberOfNeighbors > 0) {
        numberOfNeighbors = 0;
        if (counter % 500 == 0) {
            console.log(counter);
        }

        var newNeighbors = [];
        for (var coordinate in nextNeighbors) {
            if (!visitedLocations[coordinate]) {
                visitedLocations[coordinate] = counter;
            }

            //add neighbors
            var parts = coordinate.split(",");
            var col = parseInt(parts[0]);
            var row = parseInt(parts[1]);

            if (col == stop[0] && row == stop[1]) {
                numberOfNeighbors = -1000000;
                self.postMessage({imageData: imageData });
                counter = MAX;

                colorPixel(width, stop[0], stop[1], 255, 0, 0);

                //follow path back
                while (Math.abs(col - start[0]) > 1 || Math.abs(row - start[1]) > 1) {
                    var right = visitedLocations[(col + 1) + "," + row];
                    var left = visitedLocations[(col - 1) + "," + row];
                    var up = visitedLocations[col + "," + (row - 1)];
                    var down = visitedLocations[col + "," + (row + 1)];

                    //avoid undefined
                    if (!right) right = MAX;
                    if (!left) left = MAX;
                    if (!up) up = MAX;
                    if (!down) down = MAX;

                    var min = Math.min(right, left, up, down);
                    if (right == min) col++;
                    else if (left == min) col--;
                    else if (up == min) row--;
                    else if (down == min) row++;

                    colorPixel(width, row, col, 255, 0, 0);
                }
                imageData.data.set(imageDataBackup);
                self.postMessage({imageData: imageData });

                break;
            }

            var pixelIndex = (row * width + col) * 4;
            imageData.data[pixelIndex] = 255;
            imageData.data[pixelIndex + 1] = 0;
            imageData.data[pixelIndex + 2] = 0;

            //away from edge
            if (col > 0 && col < width && row > 0 && row < height) {

                //right
                if (!visitedLocations[[(col + 1) + "," + row]] && isSimilar(width, col + 1, row, start[0], start[1])) {
                    newNeighbors[(col + 1) + "," + row] = counter;
                    numberOfNeighbors++;
                }
                //left
                if (!visitedLocations[(col - 1) + "," + row] && isSimilar(width, col - 1, row, start[0], start[1])) {
                    newNeighbors[(col - 1) + "," + row] = counter;
                    numberOfNeighbors++;
                }
                //up
                if (!visitedLocations[col + "," + (row - 1)] && isSimilar(width, col, row - 1, start[0], start[1])) {
                    newNeighbors[col + "," + (row - 1)] = counter;
                    numberOfNeighbors++;
                }
                //down
                if (!visitedLocations[col + "," + (row + 1)] && isSimilar(width, col, row + 1, start[0], start[1])) {
                    newNeighbors[col + "," + (row + 1)] = counter;
                    numberOfNeighbors++;
                }
            }
        }
        nextNeighbors = newNeighbors;
        counter++;
    }

    if(numberOfNeighbors <= 0){
        self.postMessage({imageData: imageData, error:"No path found" });
    }
}, false);

function isSimilar(width, col, row, startCol, startRow) {
    var pixelIndex = (row * width + col) * 4;
    var startPixelIndex = (startRow * width + startCol) * 4;

    var rMatch = Math.abs(imageDataBackup[pixelIndex] - imageDataBackup[startPixelIndex]) < COLOR_MARGIN;
    var gMatch = Math.abs(imageDataBackup[pixelIndex + 1] - imageDataBackup[startPixelIndex + 1]) < COLOR_MARGIN;
    var bMatch = Math.abs(imageDataBackup[pixelIndex + 2] - imageDataBackup[startPixelIndex + 2]) < COLOR_MARGIN;

    return rMatch && gMatch && bMatch;
}

function colorPixel(width, row, col, r, g, b) {
    var pixelIndex = (row * width + col) * 4;
    imageDataBackup[pixelIndex] = r;
    imageDataBackup[pixelIndex + 1] = g;
    imageDataBackup[pixelIndex + 2] = b;
}