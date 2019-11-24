import {Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges} from '@angular/core';
import {FirebaseService} from "../../service/firebase.service";
import {AuthorizationService} from "../../service/authorization.service";
import {AllBalance, Balance} from "./balance";
import {User} from "../../service/model/user";
import Chart from './../../../assets/chartjs.min';
import {Subscription} from "rxjs";

@Component({
  selector: 'app-balance',
  templateUrl: './balance.component.html',
  styleUrls: ['./balance.component.scss']
})
export class BalanceComponent implements OnInit, OnChanges, OnDestroy {

  constructor(private firebaseService: FirebaseService, private authService: AuthorizationService) {
  }

  @Input()
  public isActive: boolean;

  public myBalance: Balance;
  public myUserId: string;
  public me: User;
  private chart: any;
  private chartData = {
    labels: [],//chartData.map(data => data.name),
    datasets: [{
      label: 'Я должен',
      data: [],//chartData.map(data => data.negative),
      backgroundColor: Array(10).fill('rgb(255, 99, 132)')
    }, {
      label: 'Мне должен',
      data: [],//chartData.map(data => data.positive),
      backgroundColor: Array(10).fill('rgb(54, 162, 235)')
    }]
  };
  private subscription: Subscription;

  public onBalanceUpdate(allBalance: AllBalance): void {
    if (!allBalance) {
      return;
    }
    this.myBalance = allBalance[this.myUserId];
    console.log('update my balance');
    this.prepareChartData();

    if (this.chartData.labels.length > 0) {
      if (this.isActive) {
        this.drawChart();
      }
    }
  }

  public async ngOnInit() {
    this.subscription = this.firebaseService.balanceService.onUserBalanceUpdate.subscribe(update => this.onBalanceUpdate(update));
    console.log(this.isActive);
    this.myUserId = this.authService.getUserId();
    this.me = await this.firebaseService.userService.getUser(this.myUserId);
    this.myBalance = this.firebaseService.balanceService.getUserBalance(this.me);
    if (!this.myBalance) {
      return;
    }
    this.prepareChartData();

    if (this.chartData.labels.length > 0) {
      this.drawChart();
    }
  }

  private prepareChartData() {
    const tempChartData = {};
    if (this.myBalance.positive) {
      Object.entries(this.myBalance.positive).forEach((entry) => {
        tempChartData[entry[0]] = {
          positive: 0,
          negative: 0,
          name: this.firebaseService.userService.getUserName(entry[0])
        };
        tempChartData[entry[0]].positive = entry[1];
      });
    }
    if (this.myBalance.negative) {
      Object.entries(this.myBalance.negative).forEach(entry => {
        if (!tempChartData[entry[0]]) {
          tempChartData[entry[0]] = {
            positive: 0,
            negative: 0,
            name: this.firebaseService.userService.getUserName(entry[0])
          };
        }
        tempChartData[entry[0]].negative = Math.abs(entry[1] as number);
      });
    }
    this.chartData.labels = Object.values(tempChartData).map((data: any) => data.name);
    this.chartData.datasets[0].data = Object.values(tempChartData).map((data: Balance) => data.negative);
    this.chartData.datasets[1].data = Object.values(tempChartData).map((data: Balance) => data.positive);
  }

  private drawChart() {
    if (!this.isActive) {
      return;
    }
    if (this.chart) {
      this.chart.update();
      return;
    }
    this.chart = new Chart(document.getElementById('myChart'), {
      type: 'bar',
      data: this.chartData,
      options: {
        legend: {
          labels: {
            fontSize: 14,
            fontFamily: "Roboto",
          }
        },
        scales: {
          yAxes: [{
            ticks: {
              beginAtZero: true,
            }
          }]
        }
      }
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
