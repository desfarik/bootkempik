import {Component, Input, OnChanges, SimpleChanges} from '@angular/core';
import {Balance} from "../balance/balance";
import {User} from "../../service/model/user";
import * as ChartLabelPlugin from 'chartjs-plugin-datalabels';
import {Chart} from "chart.js";

@Component({
  selector: 'app-statistic',
  templateUrl: './statistic.component.html',
  styleUrls: ['./statistic.component.scss']
})
export class StatisticComponent implements OnChanges {

  constructor() {
  }

  @Input()
  public isActive: boolean;

  @Input()
  public balance: Balance;
  @Input()
  public allUsers: User[];
  @Input()
  public me: User;
  public chart: any;
  public commonCredit: number;
  public good = false;
  public load = true;
  private chartData = {
    datasets: [{
      data: [],//chartData.map(data => data.value),
      backgroundColor: colors[0],
      label: 'Мне должны'
    }, {
      data: [],//chartData.map(data => data.value),
      backgroundColor: colors[1],
      label: 'Я должен'
    }],
    labels: [],//chartData.map(data => data.name)
  };

  public onBalanceUpdate(): void {
    if (!this.balance || !this.allUsers || !this.me) {
      return;
    }
    console.log('update all balances');
    this.prepareChartData();

    if (this.chartData.labels.length > 0) {
      this.good = false;
      this.drawChart();
    } else {
      this.good = true;
    }
  }

  private prepareChartData() {
    this.chartData.datasets = [];
    this.allUsers.forEach((user, index) => {
      this.chartData.datasets.push(
        {
          label: user.first_name,
          backgroundColor: colors[index],
          data: [this.balance.positive[user.id], Math.abs(this.balance.negative[user.id])]
        })
    });
    this.chartData.labels = ["Мне должны", "Я должен"];
  }


  private drawChart() {
    if (!this.isActive) {
      return;
    }
    this.commonCredit = this.chartData.datasets[0].data.reduce((previousValue, currentValue) => previousValue + currentValue, 0);
    if (this.chart) {
      this.chart.update();
      return;
    }
    //@ts-ignore
    this.chart = new Chart(document.getElementById('myStatChart'), {
      type: 'bar',
      data: this.chartData,
      options: {
        scales: {
          xAxes: [{
            stacked: true,
            gridLines: {
              display: false
            },
          }],
          yAxes: [{
            stacked: true,
          }]
        },
        legend: {
          display: false
        },


        plugins: {
          // Change options for ALL labels of THIS CHART
          datalabels: {
            color: '#ffffff',
            font: {
              size: 14,
              weight: 500,
              family: "Roboto",
            },
            formatter: function (value, context) {
              if (value > 0) {
                return context.dataset.label + " " + value;
              } else
                return "";
            }
          }
        }
      },
      plugins: [ChartLabelPlugin]
    });
    this.load = true;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.isActive) {
      setTimeout(() => this.onBalanceUpdate(), 0);
    }
  }
}

const colors = ["rgb(255, 99, 132)", "rgb(255, 159, 64)", "rgb(255, 205, 86)", "rgb(75, 192, 192)", "rgb(54, 162, 235)", "rgb(153, 102, 255)", "rgb(201, 203, 207)"];


interface ChartData {
  name: string;
  value: number;
}
