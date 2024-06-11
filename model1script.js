function calculatePaybackPeriods(initialInvestment, annualCashInflow, discountRate, lifeSpan) {
    let cumulativeDCF = 0;
    let cumulativeDCFWithDep = 0;
    let cumulativeDCFs = [];
    let cumulativeDCFWithDeps = [];
    let cumulativeSimpleSavings = [];
    let years = Array.from({ length: lifeSpan }, (_, i) => i + 1);

    let annualDepreciation = initialInvestment / lifeSpan;
    let simplePaybackPeriod;
    let discountedPaybackPeriod;
    let discountedPaybackPeriodWithDep;

    let cumulativeSimple = 0;

    for (let year = 1; year <= lifeSpan; year++) {
        let depreciationValue = annualDepreciation / Math.pow(1 + discountRate, year);
        let DCF = annualCashInflow / Math.pow(1 + discountRate, year);
        let adjustedAnnualCashInflow = DCF - depreciationValue;

        let DCFWithDep = adjustedAnnualCashInflow;

        cumulativeDCF += DCF;
        cumulativeDCFWithDep += DCFWithDep;

        cumulativeDCFs.push(cumulativeDCF);
        cumulativeDCFWithDeps.push(cumulativeDCFWithDep);

        cumulativeSimple += annualCashInflow;
        cumulativeSimpleSavings.push(cumulativeSimple);

        if (!simplePaybackPeriod && cumulativeSimple >= initialInvestment) {
            simplePaybackPeriod = year - 1 + (initialInvestment - cumulativeSimpleSavings[year - 2]) / annualCashInflow;
        }

        if (!discountedPaybackPeriod && cumulativeDCFs[year - 1] >= initialInvestment) {
            let previousCumulativeDCF = year > 1 ? cumulativeDCFs[year - 2] : 0;
            let remainingAmount = initialInvestment - previousCumulativeDCF;
            let currentYearDCF = cumulativeDCFs[year - 1] - previousCumulativeDCF;
            let fractionOfYear = remainingAmount / currentYearDCF;
            discountedPaybackPeriod = year - 1 + fractionOfYear;
        }

        if (!discountedPaybackPeriodWithDep && cumulativeDCFWithDeps[year - 1] >= initialInvestment) {
            let previousCumulativeDCFWithDep = year > 1 ? cumulativeDCFWithDeps[year - 2] : 0;
            let remainingAmount = initialInvestment - previousCumulativeDCFWithDep;
            let currentYearDCFWithDep = cumulativeDCFWithDeps[year - 1] - previousCumulativeDCFWithDep;
            let fractionOfYear = remainingAmount / currentYearDCFWithDep;
            discountedPaybackPeriodWithDep = year - 1 + fractionOfYear;
        }
    }

    if (cumulativeDCF < initialInvestment) {
        discountedPaybackPeriod = "The investment is not paid back within the given period.";
    }

    if (cumulativeSimple < initialInvestment) {
        simplePaybackPeriod = "The investment is not paid back within the given period.";
    }

    if (cumulativeDCFWithDep < initialInvestment) {
        discountedPaybackPeriodWithDep = "The investment is not paid back within the given period.";
    }

    return {
        discountedPeriod: discountedPaybackPeriod,
        simplePeriod: simplePaybackPeriod,
        discountedPeriodWithDep: discountedPaybackPeriodWithDep,
        cumulativeDCFs: cumulativeDCFs,
        cumulativeDCFWithDeps: cumulativeDCFWithDeps,
        cumulativeSimpleSavings: cumulativeSimpleSavings,
        years: years
    };
}

document.getElementById('inputForm').addEventListener('submit', function(event) {
    event.preventDefault();

    let peakRate = parseFloat(document.getElementById('peakRate').value);
    let peakLoad = parseFloat(document.getElementById('peakLoad').value);
    let peakTimeDurationDay = parseFloat(document.getElementById('peakTimeDurationDay').value);
    let peakTimeDurationNight = parseFloat(document.getElementById('peakTimeDurationNight').value);
    let normalRate = parseFloat(document.getElementById('normalRate').value);
    let normalLoad = parseFloat(document.getElementById('normalLoad').value);
    let normalTimeDuration = parseFloat(document.getElementById('normalTimeDuration').value);
    let lifeSpan = parseFloat(document.getElementById('lifeSpan').value);
    let discountRate = parseFloat(document.getElementById('discountRate').value) / 100;
    let epsilon = parseFloat(document.getElementById('epsilon').value);

    let Eload = peakLoad * peakTimeDurationDay + peakLoad * peakTimeDurationNight + normalLoad * normalTimeDuration;
    let solarWattage = epsilon * Eload * 1000 / 5;
    let initialInvestment = 54 * solarWattage;
    let annualCashInflow = (peakRate * peakTimeDurationDay + normalRate * normalTimeDuration) * solarWattage * 365 * 0.001;

    let result = calculatePaybackPeriods(initialInvestment, annualCashInflow, discountRate, lifeSpan);
    let discountedPaybackPeriod = result.discountedPeriod;
    let simplePaybackPeriod = result.simplePeriod;
    let discountedPaybackPeriodWithDep = result.discountedPeriodWithDep;

    document.getElementById('result').innerText = `Simple Payback Period: ${typeof simplePaybackPeriod === 'number' ? simplePaybackPeriod.toFixed(2) + " years" : simplePaybackPeriod}\nDiscounted Payback Period: ${typeof discountedPaybackPeriod === 'number' ? discountedPaybackPeriod.toFixed(2) + " years" : discountedPaybackPeriod}\nDiscounted Payback Period with Depreciation: ${typeof discountedPaybackPeriodWithDep === 'number' ? discountedPaybackPeriodWithDep.toFixed(2) + " years" : discountedPaybackPeriodWithDep}`;

    // Plotly graph
    var trace1 = {
        x: result.years,
        y: result.cumulativeDCFs,
        type: 'scatter',
        mode: 'lines+markers',
        name: 'Cumulative Discounted Cash Flows',
        line: { shape: 'linear' }
    };

    var trace2 = {
        x: [0, lifeSpan],
        y: [initialInvestment, initialInvestment],
        type: 'line',
        name: 'Initial Investment',
        line: {
            color: 'red',
            dash: 'dash'
        }
    };

    var trace3 = {
        x: result.years,
        y: result.cumulativeSimpleSavings,
        type: 'scatter',
        mode: 'lines+markers',
        name: 'Cumulative Simple Savings',
        line: { shape: 'linear', color: 'green' }
    };

    var trace4 = {
        x: result.years,
        y: result.cumulativeDCFWithDeps,
        type: 'scatter',
        mode: 'lines+markers',
        name: 'Cumulative Discounted Cash Flows with Depreciation',
        line: { shape: 'linear', color: 'blue' }
    };

    var layout = {
        title: 'Cumulative Cash Flows over Time',
        xaxis: {
            title: 'Time (Years)',
            dtick: 1
        },
        yaxis: {
            title: 'Cumulative Cash Flows (USD)'
        }
    };

    var data = [trace1, trace2, trace3, trace4];

    Plotly.newPlot('plot', data, layout);
});
