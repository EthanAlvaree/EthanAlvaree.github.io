let bodyCompositionData = {};
let bloodworkData = {};
let prescriptionsData = [];
let supplementsData = [];
const rowsPerPage = 10;
let currentSupplementsPage = 1;
let currentPrescriptionsPage = 1;

let vaccineData = [];
const rowsPerPageVaccine = 15;
let currentVaccinePage = 1;

const marginPercent = 0.10;

async function fetchBodyCompositionData() {
    try {
        const response = await fetch('body_composition_table_data.json');
        bodyCompositionData = await response.json();
        console.log("Body composition data fetched successfully:", bodyCompositionData);
        loadBodyCompositionCategory('Overview'); // Load body composition table on fetch
    } catch (error) {
        console.error("Error fetching body composition data:", error);
    }
}

async function fetchBloodworkData() {
    try {
        const response = await fetch('bloodwork_table_data.json');
        bloodworkData = await response.json();
        console.log("Bloodwork data fetched successfully:", bloodworkData);
        loadBloodworkCategory('Cardiovascular'); // Load the first category by default
    } catch (error) {
        console.error("Error fetching bloodwork data:", error);
    }
}

async function fetchSupplementsData() {
    try {
        const response = await fetch('supplements_table_data.json');
        supplementsData = await response.json();
        console.log("Supplements data fetched successfully:", supplementsData);
        loadSupplementsTable(); // Load supplements table on fetch
    } catch (error) {
        console.error("Error fetching supplements data:", error);
    }
}

async function fetchPrescriptionsData() {
    try {
        const response = await fetch('prescriptions_table_data.json');
        prescriptionsData = await response.json();
        console.log("Prescriptions data fetched successfully:", prescriptionsData);
        loadPrescriptionsTable(); // Load prescriptions table on fetch
    } catch (error) {
        console.error("Error fetching prescriptions data:", error);
    }
}

async function fetchVaccineData() {
    try {
        const response = await fetch('vaccines_table_data.json');
        vaccineData = await response.json();
        console.log("Vaccine data fetched successfully:", vaccineData);
        loadVaccineTable(); // Load vaccine table on fetch
    } catch (error) {
        console.error("Error fetching vaccine data:", error);
    }
}


function parseValue(value, range) {
    console.log("Parsing value:", value);
    if (typeof value === 'string') {
        const [min, max] = range.split(' - ').map(Number);
        const margin = (max - min) * marginPercent;
        if (value.includes('<')) {
            return parseFloat(value.replace('<', '').trim()) - margin - 0.001; // Slightly less than the threshold minus margin
        } else if (value.includes('>')) {
            return parseFloat(value.replace('>', '').trim()) + margin + 0.001; // Slightly more than the threshold plus margin
        }
    }
    return parseFloat(value);
}

function isOutOfRange(value, range) {
    console.log("Checking out of range:", value, range);
    if (range === "*") {
        return false;
    }
    const parsedValue = parseValue(value, range);
    const [min, max] = range.split(' - ').map(Number);
    return (parsedValue < min || parsedValue > max);
}

function isNearRangeBoundary(value, range, percentage = marginPercent) {
    console.log("Checking near range boundary:", value, range);
    if (range === "*") {
        return false;
    }
    const parsedValue = parseValue(value, range);
    const [min, max] = range.split(' - ').map(Number);
    const margin = (max - min) * percentage;
    return ((parsedValue >= min && parsedValue <= min + margin) || (parsedValue <= max && parsedValue >= max - margin));
}

function getCellClass(value, range, rangeType) {
    console.log("Getting cell class:", value, range, rangeType);
    if (range === "*") {
        return 'in-range';
    }
    const parsedValue = parseValue(value, range);
    const [min, max] = range.split(' - ').map(Number);
    const margin = (max - min) * marginPercent;

    switch (rangeType) {
        case 'one-sided-less':
            if (parsedValue > max) return 'out-of-range';
            if (parsedValue >= max - margin) return 'near-range-boundary';
            return 'in-range';

        case 'one-sided-more':
            if (parsedValue < min) return 'out-of-range';
            if (parsedValue <= min + margin) return 'near-range-boundary';
            return 'in-range';

        case 'two-sided':
        default:
            if (parsedValue < min || parsedValue > max) return 'out-of-range';
            if ((parsedValue >= min && parsedValue <= min + margin) || (parsedValue <= max && parsedValue >= max - margin)) return 'near-range-boundary';
            return 'in-range';
    }
}

function loadBloodworkCategory(category) {
    console.log("Loading category:", category);
    const tableBody = document.getElementById('bloodwork-table-body');
    tableBody.innerHTML = '';
    if (bloodworkData[category]) {
        bloodworkData[category].forEach(row => {
            const tr = document.createElement('tr');
            const chartId = `chart-${category}-${row.parameter.replace(/\s+/g, '-')}`;
            const dateCells = row.dates.map(date => {
                if (date === "" || row.range === "*") {
                    return `<td>${date}</td>`;
                } else {
                    const cellClass = getCellClass(date, row.range, row.rangeType);
                    const alertSymbol = cellClass === 'in-range' ? '' : ' ⚠️';
                    return `<td class="${cellClass}">${date}${alertSymbol}</td>`;
                }
            }).join('');
            tr.innerHTML = `
                <td>${row.parameter}</td>
                <td>${row.unit}</td>
                <td>${row.range}</td>
                <td><canvas id="${chartId}" width="150" height="75"></canvas></td>
                ${dateCells}
            `;
            tableBody.appendChild(tr);
            createTrendChart(chartId, row.dates, row.range, row.rangeType);
        });
    } else {
        console.log("No data found for category:", category);
    }
}

fetchBloodworkData();

function loadBloodworkCategory(category) {
    console.log("Loading category:", category);
    const tableBody = document.getElementById('bloodwork-table-body');
    tableBody.innerHTML = '';
    if (bloodworkData[category]) {
        bloodworkData[category].forEach(row => {
            const tr = document.createElement('tr');
            const chartId = `chart-${category}-${row.parameter.replace(/\s+/g, '-')}`;
            const dateCells = row.dates.map(date => {
                if (date === "" || row.range === "*") {
                    return `<td>${date}</td>`;
                } else {
                    const cellClass = getCellClass(date, row.range, row.rangeType);
                    const alertSymbol = cellClass === 'in-range' ? '' : ' ⚠️';
                    return `<td class="${cellClass}">${date}${alertSymbol}</td>`;
                }
            }).join('');
            tr.innerHTML = `
                <td>${row.parameter}</td>
                <td>${row.unit}</td>
                <td>${row.range}</td>
                <td><canvas id="${chartId}" width="150" height="75"></canvas></td>
                ${dateCells}
            `;
            tableBody.appendChild(tr);
            createTrendChart(chartId, row.dates, row.range, row.rangeType);
        });
    } else {
        console.log("No data found for category:", category);
    }
}

function loadBodyCompositionCategory(category) {
    console.log("Loading body composition category:", category);
    const tableBody = document.getElementById('body-composition-table-body');
    tableBody.innerHTML = '';
    if (bodyCompositionData[category]) {
        bodyCompositionData[category].forEach(row => {
            if (row.subrows) {
                const trGroup = document.createElement('tr');
                trGroup.innerHTML = `<td colspan="2"><strong>${row.group}</strong></td>`;
                tableBody.appendChild(trGroup);

                row.subrows.forEach(subrow => {
                    let valueCell = `<td>${subrow["5/25/24"]}</td>`;
                    if (subrow.variable.includes("T-Score")) {
                        const value = parseFloat(subrow["5/25/24"]);
                        if (value >= -2.5 && value < -1.0) {
                            valueCell = `<td class="osteopenia tooltip">${subrow["5/25/24"]} ⚠️
                                <span class="tooltiptext">
                                    <table>
                                        <tr class="green"><td>-1.0 &lt; T &lt; ∞</td><td>Normal</td></tr>
                                        <tr class="yellow"><td>-2.5 &lt; T &lt; -1.0</td><td>Osteopenia</td></tr>
                                        <tr class="red"><td>-∞ &lt; T &lt; -2.5</td><td>Osteoporosis</td></tr>
                                    </table>
                                </span>
                            </td>`;
                        } else if (value < -2.5) {
                            valueCell = `<td class="osteoporosis tooltip">${subrow["5/25/24"]} ⚠️
                                <span class="tooltiptext">
                                    <table>
                                        <tr class="green"><td>-1 &lt; T &lt; ∞</td><td>Normal</td></tr>
                                        <tr class="yellow"><td>-2.5 &lt; T &lt; -1</td><td>Osteopenia</td></tr>
                                        <tr class="red"><td>-∞ &lt; T &lt; -2.5</td><td>Osteoporosis</td></tr>
                                    </table>
                                </span>
                            </td>`;
                        }
                    }
                    const trSubrow = document.createElement('tr');
                    trSubrow.innerHTML = `
                        <td>${subrow.variable}</td>
                        ${valueCell}
                    `;
                    tableBody.appendChild(trSubrow);
                });
            } else {
                let valueCell = `<td>${row["5/25/24"]}</td>`;
                if (row.variable.includes("T-Score")) {
                    const value = parseFloat(row["5/25/24"]);
                    if (value >= -2.5 && value < -1.0) {
                        valueCell = `<td class="osteopenia tooltip">${row["5/25/24"]} ⚠️
                            <span class="tooltiptext">
                                <table>
                                    <tr class="green"><td>-1.0 &lt; T &lt; ∞</td><td>Normal</td></tr>
                                    <tr class="yellow"><td>-2.5 &lt; T &lt; -1.0</td><td>Osteopenia</td></tr>
                                    <tr class="red"><td>-∞ &lt; T &lt; -2.5</td><td>Osteoporosis</td></tr>
                                </table>
                            </span>
                        </td>`;
                    } else if (value < -2.5) {
                        valueCell = `<td class="osteoporosis tooltip">${row["5/25/24"]} ⚠️
                            <span class="tooltiptext">
                                <table>
                                    <tr class="green"><td>-1 &lt; T &lt; ∞</td><td>Normal</td></tr>
                                    <tr class="yellow"><td>-2.5 &lt; T &lt; -1</td><td>Osteopenia</td></tr>
                                    <tr class="red"><td>-∞ &lt; T &lt; -2.5</td><td>Osteoporosis</td></tr>
                                </table>
                            </span>
                        </td>`;
                    }
                }
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${row.variable}</td>
                    ${valueCell}
                `;
                tableBody.appendChild(tr);
            }
        });
    } else {
        console.log("No data found for category:", category);
    }
}

function loadSupplementsTable() {
    const tableBody = document.getElementById('supplements-table-body');
    tableBody.innerHTML = '';
    const start = (currentSupplementsPage - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    const pageData = supplementsData.slice(start, end);

    function addRowListeners(mainRow, subRows) {
        function highlightRows() {
            mainRow.classList.add('highlight');
            subRows.forEach(subRow => subRow.classList.add('highlight'));
        }

        function unhighlightRows() {
            mainRow.classList.remove('highlight');
            subRows.forEach(subRow => subRow.classList.remove('highlight'));
        }

        mainRow.addEventListener('mouseenter', highlightRows);
        mainRow.addEventListener('mouseleave', unhighlightRows);

        subRows.forEach(subRow => {
            subRow.addEventListener('mouseenter', highlightRows);
            subRow.addEventListener('mouseleave', unhighlightRows);
        });
    }

    pageData.forEach(row => {
        if (row.subrows) {
            const mainRow = document.createElement('tr');
            mainRow.classList.add('main-row');
            mainRow.innerHTML = `
                <td rowspan="${row.subrows.length}">${row.name}</td>
                <td rowspan="${row.subrows.length}"><a href="${row.brand_url}">${row.brand}</a></td>
                <td>${row.subrows[0].dose}</td>
                <td>${row.subrows[0].dv}</td>
                <td>${row.subrows[0].molecule}</td>
                <td rowspan="${row.subrows.length}">${row.ingredients || ''}</td>
                <td rowspan="${row.subrows.length}">${row.morning || ''}</td>
                <td rowspan="${row.subrows.length}">${row.evening || ''}</td>
            `;
            tableBody.appendChild(mainRow);

            const subRows = [];
            row.subrows.slice(1).forEach(subrow => {
                const subRow = document.createElement('tr');
                subRow.classList.add('subrow');
                subRow.innerHTML = `
                    <td>${subrow.dose}</td>
                    <td>${subrow.dv}</td>
                    <td>${subrow.molecule}</td>
                `;
                tableBody.appendChild(subRow);
                subRows.push(subRow);
            });

            addRowListeners(mainRow, subRows);
        } else {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${row.name}</td>
                <td><a href="${row.brand_url}">${row.brand}</a></td>
                <td>${row.dose}</td>
                <td>${row.dv}</td>
                <td>${row.molecule}</td>
                <td>${row.ingredients || ''}</td>
                <td>${row.morning || ''}</td>
                <td>${row.evening || ''}</td>
            `;
            tableBody.appendChild(tr);
        }
    });
    updateSupplementsPagination();
}

function loadPrescriptionsTable() {
    const tableBody = document.getElementById('prescriptions-table-body');
    tableBody.innerHTML = '';
    const start = (currentPrescriptionsPage - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    const pageData = prescriptionsData.slice(start, end);
    pageData.forEach(row => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${row.molecule}</td>
            <td>${row.dose}</td>
            <td>${row.frequency}</td>
        `;
        tableBody.appendChild(tr);
    });
    updatePrescriptionsPagination();
}

function loadVaccineTable() {
    const tableBody = document.getElementById('vaccines-table-body');
    tableBody.innerHTML = '';
    const start = (currentVaccinePage - 1) * rowsPerPageVaccine;
    const end = start + rowsPerPageVaccine;
    const pageData = Object.entries(vaccineData).slice(start, end);
    pageData.forEach(([vaccine, doses]) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><strong>${vaccine}</strong></td>
            ${doses.map(dose => `<td style="font-size:14px">${dose}</td>`).join('')}
        `;
        tableBody.appendChild(tr);
    });
    updateVaccinePagination();
}

function updateSupplementsPagination() {
    const pagination = document.getElementById('supplements-pagination');
    pagination.innerHTML = '';
    const totalPages = Math.ceil(supplementsData.length / rowsPerPage);
    for (let i = 1; i <= totalPages; i++) {
        const button = document.createElement('button');
        button.textContent = i;
        button.disabled = i === currentSupplementsPage;
        button.addEventListener('click', () => {
            currentSupplementsPage = i;
            loadSupplementsTable();
        });
        pagination.appendChild(button);
    }
}

function updatePrescriptionsPagination() {
    const pagination = document.getElementById('prescriptions-pagination');
    pagination.innerHTML = '';
    const totalPages = Math.ceil(prescriptionsData.length / rowsPerPage);
    for (let i = 1; i <= totalPages; i++) {
        const button = document.createElement('button');
        button.textContent = i;
        button.disabled = i === currentPrescriptionsPage;
        button.addEventListener('click', () => {
            currentPrescriptionsPage = i;
            loadPrescriptionsTable();
        });
        pagination.appendChild(button);
    }
}

function updateVaccinePagination() {
    const pagination = document.getElementById('vaccines-pagination');
    pagination.innerHTML = '';
    const totalPages = Math.ceil(Object.keys(vaccineData).length / rowsPerPageVaccine);
    for (let i = 1; i <= totalPages; i++) {
        const button = document.createElement('button');
        button.textContent = i;
        button.disabled = i === currentVaccinePage;
        button.addEventListener('click', () => {
            currentVaccinePage = i;
            loadVaccineTable();
        });
        pagination.appendChild(button);
    }
}

document.getElementById('bloodwork-search-input').addEventListener('input', function () {
    const searchText = this.value.toLowerCase();
    const tableBody = document.getElementById('bloodwork-table-body');
    tableBody.innerHTML = '';
    if (searchText === '') {
        loadBloodworkCategory(document.querySelector('.category.active')?.textContent || 'Cardiovascular');
    } else {
        Object.values(bloodworkData).flat().forEach(row => {
            const rowText = Object.values(row).flat().join(' ').toLowerCase();
            if (rowText.includes(searchText)) {
                const tr = document.createElement('tr');
                const chartId = `chart-search-${row.parameter.replace(/\s+/g, '-')}`;
                const dateCells = row.dates.map(date => {
                    if (date === "" || row.range === "*") {
                        return `<td>${date}</td>`;
                    } else if (isOutOfRange(date, row.range)) {
                        return `<td class="out-of-range">${date} ⚠️</td>`;
                    } else {
                        return `<td>${date}</td>`;
                    }
                }).join('');
                tr.innerHTML = `
                    <td>${row.parameter}</td>
                    <td>${row.unit}</td>
                    <td>${row.range}</td>
                    <td><canvas id="${chartId}" width="150" height="75"></canvas></td>
                    ${dateCells}
                `;
                tableBody.appendChild(tr);
                createTrendChart(chartId, row.dates, row.range);
            }
        });
    }
});

document.getElementById('body-composition-search-input').addEventListener('input', function () {
    const searchText = this.value.toLowerCase();
    const tableBody = document.getElementById('body-composition-table-body');
    tableBody.innerHTML = '';
    if (searchText === '') {
        loadBodyCompositionCategory(document.querySelector('.category.active')?.textContent || 'Overview');
    } else {
        Object.values(bodyCompositionData).flat().forEach(row => {
            const rowText = Object.values(row).flat().join(' ').toLowerCase();
            if (rowText.includes(searchText)) {
                if (row.subrows) {
                    const trGroup = document.createElement('tr');
                    trGroup.innerHTML = `<td colspan="2"><strong>${row.group}</strong></td>`;
                    tableBody.appendChild(trGroup);

                    row.subrows.forEach(subrow => {
                        const trSubrow = document.createElement('tr');
                        trSubrow.innerHTML = `
                            <td>${subrow.variable}</td>
                            <td>${subrow["5/25/24"]}</td>
                        `;
                        tableBody.appendChild(trSubrow);
                    });
                } else {
                    const tr = document.createElement('tr');
                    tr.innerHTML = `
                        <td>${row.variable}</td>
                        <td>${row["5/25/24"]}</td>
                    `;
                    tableBody.appendChild(tr);
                }
            }
        });
    }
});

document.getElementById('supplements-search-input').addEventListener('input', function () {
    const searchText = this.value.toLowerCase();
    const tableBody = document.getElementById('supplements-table-body');
    tableBody.innerHTML = '';
    if (searchText === '') {
        loadSupplementsTable();
    } else {
        supplementsData.forEach(row => {
            const rowText = row.subrows ? 
                Object.values(row).flat().concat(row.subrows.flatMap(subrow => Object.values(subrow))).join(' ').toLowerCase() :
                Object.values(row).flat().join(' ').toLowerCase();
            if (rowText.includes(searchText)) {
                if (row.subrows) {
                    const mainRow = document.createElement('tr');
                    mainRow.classList.add('main-row');
                    mainRow.innerHTML = `
                        <td rowspan="${row.subrows.length}">${row.name}</td>
                        <td rowspan="${row.subrows.length}"><a href="${row.brand_url}">${row.brand}</a></td>
                        <td>${row.subrows[0].dose}</td>
                        <td>${row.subrows[0].dv}</td>
                        <td>${row.subrows[0].molecule}</td>
                        <td rowspan="${row.subrows.length}">${row.ingredients || ''}</td>
                        <td rowspan="${row.subrows.length}">${row.morning || ''}</td>
                        <td rowspan="${row.subrows.length}">${row.evening || ''}</td>
                    `;
                    tableBody.appendChild(mainRow);

                    const subRows = [];
                    for (let i = 1; i < row.subrows.length; i++) {
                        const subrow = row.subrows[i];
                        const subRow = document.createElement('tr');
                        subRow.classList.add('subrow');
                        subRow.innerHTML = `
                            <td>${subrow.dose}</td>
                            <td>${subrow.dv}</td>
                            <td>${subrow.molecule}</td>
                        `;
                        tableBody.appendChild(subRow);
                        subRows.push(subRow);
                    }

                    function highlightRows() {
                        mainRow.classList.add('highlight');
                        subRows.forEach(subRow => subRow.classList.add('highlight'));
                    }

                    function unhighlightRows() {
                        mainRow.classList.remove('highlight');
                        subRows.forEach(subRow => subRow.classList.remove('highlight'));
                    }

                    mainRow.addEventListener('mouseenter', highlightRows);
                    mainRow.addEventListener('mouseleave', unhighlightRows);

                    subRows.forEach(subRow => {
                        subRow.addEventListener('mouseenter', highlightRows);
                        subRow.addEventListener('mouseleave', unhighlightRows);
                    });
                } else {
                    const tr = document.createElement('tr');
                    tr.innerHTML = `
                        <td>${row.name}</td>
                        <td><a href="${row.brand_url}">${row.brand}</a></td>
                        <td>${row.dose}</td>
                        <td>${row.dv}</td>
                        <td>${row.molecule}</td>
                        <td>${row.ingredients || ''}</td>
                        <td>${row.morning || ''}</td>
                        <td>${row.evening || ''}</td>
                    `;
                    tableBody.appendChild(tr);
                }
            }
        });
    }
});

document.getElementById('prescriptions-search-input').addEventListener('input', function () {
    const searchText = this.value.toLowerCase();
    const tableBody = document.getElementById('prescriptions-table-body');
    tableBody.innerHTML = '';
    if (searchText === '') {
        loadPrescriptionsTable();
    } else {
        prescriptionsData.forEach(row => {
            const rowText = Object.values(row).flat().join(' ').toLowerCase();
            if (rowText.includes(searchText)) {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${row.molecule}</td>
                    <td>${row.dose}</td>
                    <td>${row.frequency}</td>
                `;
                tableBody.appendChild(tr);
            }
        });
    }
});

document.getElementById('vaccines-search-input').addEventListener('input', function () {
    const searchText = this.value.toLowerCase();
    const tableBody = document.getElementById('vaccines-table-body');
    tableBody.innerHTML = '';
    if (searchText === '') {
        loadVaccineTable();
    } else {
        Object.entries(vaccineData).forEach(([vaccine, doses]) => {
            if (vaccine.toLowerCase().includes(searchText) || doses.some(dose => dose.toLowerCase().includes(searchText))) {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${vaccine}</td>
                    ${doses.map(dose => `<td>${dose}</td>`).join('')}
                `;
                tableBody.appendChild(tr);
            }
        });
    }
});

fetchBodyCompositionData();
fetchSupplementsData();
fetchPrescriptionsData();
fetchVaccineData();

function createTrendChart(chartId, data, range, rangeType) {
    const ctx = document.getElementById(chartId).getContext('2d');
    const parsedData = data.map(value => value === "" ? null : parseFloat(value)).reverse();
    const labels = ['12/22', '5/23', '9/23', '5/24'];

    let minRange, maxRange;
    if (range === "*") {
        minRange = Math.min(...parsedData.filter(val => val !== null)) - 5;
        maxRange = Math.max(...parsedData.filter(val => val !== null)) + 5;
    } else {
        [minRange, maxRange] = range.split(' - ').map(Number);
    }

    const observedMin = Math.min(...parsedData.filter(val => val !== null));
    const observedMax = Math.max(...parsedData.filter(val => val !== null));

    // Set the y-axis limits with a margin
    const margin = (maxRange - minRange) * marginPercent;
    const yMin = Math.min(minRange, observedMin) - margin;
    const yMax = Math.max(maxRange, observedMax) + margin;

    const pointColors = parsedData.map(value => {
        if (value === null) {
            return 'gray';
        } else if (rangeType === 'one-sided-less') {
            if (value > maxRange) return 'red';
            if (value >= maxRange - margin) return 'yellow';
            return 'green';
        } else if (rangeType === 'one-sided-more') {
            if (value < minRange) return 'red';
            if (value <= minRange + margin) return 'yellow';
            return 'green';
        } else { // two-sided
            if (value < minRange || value > maxRange) return 'red';
            if ((value >= minRange && value <= minRange + margin) || (value <= maxRange && value >= maxRange - margin)) return 'yellow';
            return 'green';
        }
    });

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                data: parsedData,
                borderColor: 'black',
                backgroundColor: 'rgba(0, 0, 0, 0)',
                pointBackgroundColor: pointColors,
                fill: false,
                tension: 0.1,
                pointRadius: 5
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: false,
                    min: yMin,
                    max: yMax,
                    ticks: {
                        stepSize: (yMax - yMin) / 10
                    },
                    grid: {
                        display: false
                    }
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                },
                annotation: {
                    annotations: getChartAnnotations(minRange, maxRange, rangeType, range)
                }
            },
            layout: {
                padding: {
                    top: 10,
                    bottom: 10
                }
            }
        }
    });
}

function getChartAnnotations(minRange, maxRange, rangeType, range) {
    const annotations = {
        box1: {
            type: 'box',
            yScaleID: 'y',
            yMin: minRange,
            yMax: maxRange,
            backgroundColor: range === "*" ? 'rgba(144, 238, 144, 0.5)' : 'rgba(144, 238, 144, 0.5)', // light green for in-range values
        }
    };

    if (range !== "*") {
        const margin = (maxRange - minRange) * marginPercent;

        switch (rangeType) {
            case 'one-sided-less':
                annotations.box2 = {
                    type: 'box',
                    yScaleID: 'y',
                    yMin: maxRange - margin,
                    yMax: maxRange,
                    backgroundColor: 'rgba(255, 255, 102, 0.5)', // light yellow for near range boundary above
                };
                annotations.box3 = {
                    type: 'box',
                    yScaleID: 'y',
                    yMin: maxRange,
                    yMax: maxRange + margin,
                    backgroundColor: 'rgba(255, 102, 102, 0.5)', // light red for out-of-range values above max
                };
                break;

            case 'one-sided-more':
                annotations.box2 = {
                    type: 'box',
                    yScaleID: 'y',
                    yMin: minRange,
                    yMax: minRange + margin,
                    backgroundColor: 'rgba(255, 255, 102, 0.5)', // light yellow for near range boundary below
                };
                annotations.box3 = {
                    type: 'box',
                    yScaleID: 'y',
                    yMin: minRange - margin,
                    yMax: minRange,
                    backgroundColor: 'rgba(255, 102, 102, 0.5)', // light red for out-of-range values below min
                };
                break;

            case 'two-sided':
            default:
                annotations.box2 = {
                    type: 'box',
                    yScaleID: 'y',
                    yMin: minRange,
                    yMax: minRange + margin,
                    backgroundColor: 'rgba(255, 255, 102, 0.5)', // light yellow for near range boundary below
                };
                annotations.box3 = {
                    type: 'box',
                    yScaleID: 'y',
                    yMin: maxRange - margin,
                    yMax: maxRange,
                    backgroundColor: 'rgba(255, 255, 102, 0.5)', // light yellow for near range boundary above
                };
                annotations.box4 = {
                    type: 'box',
                    yScaleID: 'y',
                    yMin: minRange - margin,
                    yMax: minRange,
                    backgroundColor: 'rgba(255, 102, 102, 0.5)', // light red for out-of-range values below min
                };
                annotations.box5 = {
                    type: 'box',
                    yScaleID: 'y',
                    yMin: maxRange,
                    yMax: maxRange + margin,
                    backgroundColor: 'rgba(255, 102, 102, 0.5)', // light red for out-of-range values above max
                };
                break;
        }
    }

    return annotations;
}

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();

        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});