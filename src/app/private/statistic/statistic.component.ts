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
export class StatisticComponent implements OnInit, OnDestroy, OnChanges {

  constructor(private firebaseService: FirebaseService, private authService: AuthorizationService) {
  }

  @Input()
  public isActive: boolean;

  public allBalances: AllBalance;
  public allUsers: User[];
  public me: User;
  public chart: any;
  public ownBalance: number;
  private chartData = {
    datasets: [{
      data: [],//chartData.map(data => data.value),
      backgroundColor: colors.sort(() => Math.random() - 0.5),
      label: 'Dataset 1'
    }],
    labels: [],//chartData.map(data => data.name)
  };
  private subscription: Subscription;

  public onBalanceUpdate(allBalance: AllBalance): void {
    if (!allBalance) {
      return;
    }
    this.allBalances = allBalance;
    console.log('update all balances');
    this.prepareChartData();

    if (this.chartData.labels.length > 0) {
      if (this.isActive) {
        this.drawChart();
      }
    }
  }

  public async ngOnInit() {
    this.subscription = this.firebaseService.balanceService.onAllBalanceUpdate.subscribe(update => this.onBalanceUpdate(update));
    this.me = this.authService.getCurrentUser();
    this.allUsers = await this.firebaseService.userService.getAllUsers();
    this.allBalances = await this.firebaseService.balanceService.getAllBalances();
    if (!this.allBalances) {
      return;
    }
    this.prepareChartData();
    this.drawChart();
  }

  private prepareChartData() {
    const tempChartData = [];
    this.allUsers.forEach(user => {
      if (this.allBalances[user.id] && this.allBalances[user.id].negative) {
        const balance = Object.values(this.allBalances[user.id].negative).reduce((previousValue, currentValue) => previousValue as number + Math.abs(currentValue as number), 0);
        tempChartData.push({name: user.first_name, value: balance});
      }
    });
    this.chartData.labels = tempChartData.map(data => data.name);
    this.chartData.datasets[0].data = tempChartData.map(data => data.value);
  }


  private drawChart() {
    if (!this.isActive) {
      return;
    }
    this.ownBalance = this.chartData.datasets[0].data.reduce((previousValue, currentValue) => previousValue + currentValue, 0);
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
            fontSize: 14,
            fontFamily: "Roboto",
            formatter: function (value, context) {
              return context.chart.data.labels[context.dataIndex] + " " + value;
            }
          }
        }
      },
      plugins: [ChartLabelPlugin]
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.isActive.previousValue === undefined) {
      return;
    }
    if (this.isActive) {
      if (!this.chart) {
        setTimeout(() => this.drawChart(), 0);
      } else {
        this.chart.update();
      }
    }
  }

  public ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}

const colors = ["rgb(255, 99, 132)", "rgb(255, 159, 64)", "rgb(255, 205, 86)", "rgb(75, 192, 192)", "rgb(54, 162, 235)", "rgb(153, 102, 255)", "rgb(201, 203, 207)"];


interface ChartData {
  name: string;
  value: number;
}
