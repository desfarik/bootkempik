import {Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges} from '@angular/core';
import {FirebaseService} from "../../service/firebase.service";
import {AuthorizationService} from "../../service/authorization.service";
import {AllBalance, Balance} from "../balance/balance";
import {User} from "../../service/model/user";
import * as ChartLabelPlugin from 'chartjs-plugin-datalabels';
import {Chart} from "chart.js";
import {Subscription} from "rxjs";

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
  public allBalances: AllBalance;
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
      backgroundColor: colors.sort(() => Math.random() - 0.5),
      label: 'Dataset 1'
    }],
    labels: [],//chartData.map(data => data.name)
  };

  public onBalanceUpdate(): void {
    if (!this.allBalances || !this.allUsers || !this.me) {
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
    let tempChartData = [];
    this.allUsers.forEach(user => {
      if (this.allBalances[user.id] && this.allBalances[user.id].negative) {
        const balance = Object.values(this.allBalances[user.id].negative).reduce((previousValue, currentValue) => previousValue as number + Math.abs(currentValue as number), 0);
        tempChartData.push({name: user.first_name, value: balance});
      }
    });
    tempChartData = tempChartData.filter(data => data.value > 0);
    this.chartData.labels = tempChartData.map(data => data.name);
    this.chartData.datasets[0].data = tempChartData.map(data => data.value);
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
      type: 'pie',
      data: this.chartData,
      options: {
        legend: {
          labels: {
            fontSize: 14,
            fontFamily: "Roboto",
          }
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
              return context.chart.data.labels[context.dataIndex] + " " + value;
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
