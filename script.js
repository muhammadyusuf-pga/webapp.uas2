// Set current year in footer
document.getElementById('current-year').textContent = new Date().getFullYear();

// Display user data
function updateUserDataDisplay() {
    const nama = document.getElementById('nama').value || '[Belum diisi]';
    const nim = document.getElementById('nim').value || '[Belum diisi]';
    const universitas = document.getElementById('universitas').value || '[Belum diisi]';
    
    const userDataElement = document.getElementById('user-data');
    userDataElement.innerHTML = `
        <p><strong>Nama:</strong> ${nama}</p>
        <p><strong>NIM:</strong> ${nim}</p>
        <p><strong>Universitas:</strong> ${universitas}</p>
    `;
}

// Update user data display when inputs change
document.getElementById('nama').addEventListener('input', updateUserDataDisplay);
document.getElementById('nim').addEventListener('input', updateUserDataDisplay);
document.getElementById('universitas').addEventListener('input', updateUserDataDisplay);

// Initialize user data display
updateUserDataDisplay();

// Gauss Jordan Implementation
class GaussJordanSolver {
    constructor(matrixA, vectorB) {
        this.matrix = this.createAugmentedMatrix(matrixA, vectorB);
        this.n = matrixA.length;
    }
    
    createAugmentedMatrix(A, b) {
        const n = A.length;
        const augmented = [];
        
        for (let i = 0; i < n; i++) {
            augmented[i] = [...A[i], b[i]];
        }
        
        return augmented;
    }
    
    solve() {
        const n = this.n;
        const matrix = this.matrix.map(row => [...row]);
        
        // Forward elimination to create reduced row echelon form
        for (let i = 0; i < n; i++) {
            // Find pivot
            let maxRow = i;
            for (let j = i + 1; j < n; j++) {
                if (Math.abs(matrix[j][i]) > Math.abs(matrix[maxRow][i])) {
                    maxRow = j;
                }
            }
            
            // Swap rows if necessary
            if (maxRow !== i) {
                [matrix[i], matrix[maxRow]] = [matrix[maxRow], matrix[i]];
            }
            
            // Make sure pivot is not zero
            if (Math.abs(matrix[i][i]) < 1e-10) {
                throw new Error("Matrix is singular or nearly singular");
            }
            
            // Normalize the pivot row
            const pivot = matrix[i][i];
            for (let j = i; j <= n; j++) {
                matrix[i][j] /= pivot;
            }
            
            // Eliminate other rows
            for (let j = 0; j < n; j++) {
                if (j !== i) {
                    const factor = matrix[j][i];
                    for (let k = i; k <= n; k++) {
                        matrix[j][k] -= factor * matrix[i][k];
                    }
                }
            }
        }
        
        // Extract solution
        const solution = [];
        for (let i = 0; i < n; i++) {
            solution.push(matrix[i][n]);
        }
        
        return solution;
    }
    
    getSolutionString(solution) {
        let result = "Solusi sistem persamaan linear:\n\n";
        solution.forEach((value, index) => {
            result += `x${index + 1} = ${value.toFixed(6)}\n`;
        });
        
        result += `\nVerifikasi (A * x = b):\n`;
        
        // Reconstruct matrix A from augmented matrix
        const A = this.matrix.map(row => row.slice(0, this.n));
        
        // Calculate A * x
        for (let i = 0; i < this.n; i++) {
            let sum = 0;
            for (let j = 0; j < this.n; j++) {
                sum += A[i][j] * solution[j];
            }
            result += `Baris ${i + 1}: ${sum.toFixed(6)} (harusnya ${this.matrix[i][this.n].toFixed(6)})\n`;
        }
        
        return result;
    }
}

// Euler Method Implementation
class EulerMethodSolver {
    constructor(f, x0, y0, h, targetX) {
        this.f = f; // Function dy/dx = f(x, y)
        this.x0 = x0;
        this.y0 = y0;
        this.h = h;
        this.targetX = targetX;
    }
    
    // Parse function string to actual function
    parseFunction(funcStr) {
        return (x, y) => {
            // Replace x and y with their values
            const expression = funcStr
                .replace(/x/g, x)
                .replace(/y/g, y)
                .replace(/sin\(/g, 'Math.sin(')
                .replace(/cos\(/g, 'Math.cos(')
                .replace(/tan\(/g, 'Math.tan(')
                .replace(/exp\(/g, 'Math.exp(')
                .replace(/log\(/g, 'Math.log(')
                .replace(/sqrt\(/g, 'Math.sqrt(')
                .replace(/\^/g, '**');
            
            try {
                return eval(expression);
            } catch (e) {
                throw new Error("Error parsing function. Please use valid JavaScript math syntax.");
            }
        };
    }
    
    solve() {
        const f = this.parseFunction(this.f);
        const steps = [];
        
        let x = this.x0;
        let y = this.y0;
        let step = 0;
        
        steps.push({step: step, x: x.toFixed(4), y: y.toFixed(6), dy: 'N/A'});
        
        while (x < this.targetX - 1e-10) {
            const dy = f(x, y);
            y = y + this.h * dy;
            x = x + this.h;
            step++;
            
            steps.push({step: step, x: x.toFixed(4), y: y.toFixed(6), dy: dy.toFixed(6)});
            
            // Break if we've done too many steps
            if (step > 1000) break;
        }
        
        // If we overshot, do one more step with adjusted h
        if (x > this.targetX + 1e-10) {
            const lastStep = steps[steps.length - 2];
            x = parseFloat(lastStep.x);
            y = parseFloat(lastStep.y);
            const adjustedH = this.targetX - x;
            const dy = f(x, y);
            y = y + adjustedH * dy;
            x = this.targetX;
            
            steps.push({step: step + 1, x: x.toFixed(4), y: y.toFixed(6), dy: dy.toFixed(6), note: "Step adjusted"});
        }
        
        return {
            finalY: y,
            steps: steps
        };
    }
    
    getSolutionString(result) {
        let solution = `Metode Euler untuk dy/dx = ${this.f}\n`;
        solution += `Dengan kondisi awal: x0 = ${this.x0}, y0 = ${this.y0}\n`;
        solution += `Step size (h) = ${this.h}\n`;
        solution += `Nilai x target = ${this.targetX}\n\n`;
        solution += `Hasil: y(${this.targetX}) = ${result.finalY.toFixed(6)}\n\n`;
        
        return solution;
    }
    
    getStepsString(steps) {
        if (steps.length === 0) return "Tidak ada langkah perhitungan.";
        
        let stepsStr = "Langkah-langkah perhitungan:\n\n";
        stepsStr += "Step |    x    |    y    |   dy/dx\n";
        stepsStr += "-----|---------|---------|---------\n";
        
        steps.forEach(step => {
            stepsStr += `${step.step.toString().padStart(4)} | ${step.x.padStart(7)} | ${step.y.padStart(7)} | ${step.dy.padStart(7)}\n`;
        });
        
        return stepsStr;
    }
}

// Matrix input handling for Gauss Jordan
function createMatrixInputs(size) {
    const container = document.getElementById('matrix-container');
    container.innerHTML = '';
    
    // Create grid for matrix A and vector b
    const grid = document.createElement('div');
    grid.className = 'matrix-grid';
    grid.style.gridTemplateColumns = `repeat(${parseInt(size) + 1}, 1fr)`;
    
    for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
            const cell = document.createElement('div');
            cell.className = 'matrix-cell';
            
            const input = document.createElement('input');
            input.type = 'number';
            input.value = i === j ? '1' : '0';
            input.id = `a${i}${j}`;
            input.step = 'any';
            
            cell.appendChild(input);
            
            if (j < size - 1) {
                const plus = document.createElement('span');
                plus.textContent = j === size - 1 ? '' : ' ';
                cell.appendChild(plus);
            }
            
            grid.appendChild(cell);
        }
        
        // Add equals sign and vector b element
        const equalsCell = document.createElement('div');
        equalsCell.className = 'matrix-cell';
        equalsCell.innerHTML = '<span style="margin: 0 10px;">=</span>';
        grid.appendChild(equalsCell);
        
        const bCell = document.createElement('div');
        bCell.className = 'matrix-cell';
        
        const bInput = document.createElement('input');
        bInput.type = 'number';
        bInput.value = i === 0 ? '1' : '0';
        bInput.id = `b${i}`;
        bInput.step = 'any';
        
        bCell.appendChild(bInput);
        grid.appendChild(bCell);
    }
    
    container.appendChild(grid);
}

// Initialize matrix inputs with default size 3
createMatrixInputs(3);

// Update matrix inputs when size changes
document.getElementById('matrix-size').addEventListener('change', function() {
    createMatrixInputs(this.value);
});

// Gauss Jordan Calculation
document.getElementById('calculate-gauss').addEventListener('click', function() {
    try {
        const size = parseInt(document.getElementById('matrix-size').value);
        
        // Get matrix A
        const A = [];
        for (let i = 0; i < size; i++) {
            A[i] = [];
            for (let j = 0; j < size; j++) {
                const value = parseFloat(document.getElementById(`a${i}${j}`).value);
                if (isNaN(value)) {
                    throw new Error(`Nilai pada A[${i+1}][${j+1}] tidak valid`);
                }
                A[i][j] = value;
            }
        }
        
        // Get vector b
        const b = [];
        for (let i = 0; i < size; i++) {
            const value = parseFloat(document.getElementById(`b${i}`).value);
            if (isNaN(value)) {
                throw new Error(`Nilai pada b[${i+1}] tidak valid`);
            }
            b[i] = value;
        }
        
        // Solve using Gauss Jordan
        const solver = new GaussJordanSolver(A, b);
        const solution = solver.solve();
        const resultString = solver.getSolutionString(solution);
        
        // Display result
        document.getElementById('gauss-result').innerHTML = `<pre>${resultString}</pre>`;
        
        // Add user data to result
        const nama = document.getElementById('nama').value || 'Tidak ada';
        const nim = document.getElementById('nim').value || 'Tidak ada';
        
        const userInfo = `\n\n---\nPerhitungan oleh:\nNama: ${nama}\nNIM: ${nim}`;
        document.getElementById('gauss-result').innerHTML += `<pre>${userInfo}</pre>`;
        
    } catch (error) {
        document.getElementById('gauss-result').innerHTML = `<p style="color: #d32f2f;">Error: ${error.message}</p>`;
    }
});

// Euler Method Calculation
document.getElementById('calculate-euler').addEventListener('click', function() {
    try {
        // Get input values
        const funcStr = document.getElementById('euler-function').value;
        const x0 = parseFloat(document.getElementById('x0').value);
        const y0 = parseFloat(document.getElementById('y0').value);
        const h = parseFloat(document.getElementById('h').value);
        const targetX = parseFloat(document.getElementById('target-x').value);
        
        // Validate inputs
        if (isNaN(x0) || isNaN(y0) || isNaN(h) || isNaN(targetX)) {
            throw new Error("Semua parameter harus berupa angka yang valid");
        }
        
        if (h <= 0) {
            throw new Error("Step size (h) harus lebih besar dari 0");
        }
        
        if (targetX <= x0) {
            throw new Error("Nilai x target harus lebih besar dari nilai awal x0");
        }
        
        // Solve using Euler Method
        const solver = new EulerMethodSolver(funcStr, x0, y0, h, targetX);
        const result = solver.solve();
        
        // Display results
        const solutionString = solver.getSolutionString(result);
        const stepsString = solver.getStepsString(result.steps);
        
        document.getElementById('euler-result').innerHTML = `<pre>${solutionString}</pre>`;
        document.getElementById('euler-steps-container').innerHTML = `<pre>${stepsString}</pre>`;
        
        // Add user data to result
        const nama = document.getElementById('nama').value || 'Tidak ada';
        const nim = document.getElementById('nim').value || 'Tidak ada';
        const universitas = document.getElementById('universitas').value || 'Tidak ada';
        
        const userInfo = `\n\n---\nPerhitungan oleh:\nNama: ${nama}\nNIM: ${nim}\nUniversitas: ${universitas}`;
        document.getElementById('euler-result').innerHTML += `<pre>${userInfo}</pre>`;
        
    } catch (error) {
        document.getElementById('euler-result').innerHTML = `<p style="color: #d32f2f;">Error: ${error.message}</p>`;
        document.getElementById('euler-steps-container').innerHTML = `<p style="color: #d32f2f;">${error.message}</p>`;
    }
});

// Initialize with example data and calculate
window.addEventListener('load', function() {
    // Fill in some example data
    document.getElementById('nama').value = 'Ahmad Fauzi';
    document.getElementById('nim').value = '123456789';
    document.getElementById('universitas').value = 'Universitas Teknologi Indonesia';
    
    // Update user display
    updateUserDataDisplay();
    
    // Fill matrix with interesting values for 3x3
    document.getElementById('a00').value = '2';
    document.getElementById('a01').value = '1';
    document.getElementById('a02').value = '-1';
    document.getElementById('a10').value = '-3';
    document.getElementById('a11').value = '-1';
    document.getElementById('a12').value = '2';
    document.getElementById('a20').value = '-2';
    document.getElementById('a21').value = '1';
    document.getElementById('a22').value = '2';
    
    document.getElementById('b0').value = '8';
    document.getElementById('b1').value = '-11';
    document.getElementById('b2').value = '-3';
});