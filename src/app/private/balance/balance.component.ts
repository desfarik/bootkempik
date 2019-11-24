import {Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges} from '@angular/core';
import {FirebaseService} from "../../service/firebase.service";
import {AuthorizationService} from "../../service/authorization.service";
import {AllBalance, Balance} from "./balance";
import {User} from "../../service/model/user";
import {Subscription} from "rxjs";
import {Chart} from "chart.js";
import * as ChartLabelPlugin from "chartjs-plugin-datalabels";
import {FormControl, FormGroup, Validators} from "@angular/forms";

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

  public persons: string[] = [];
  public selectedPerson: string;

  public formGroup = new FormGroup({
    'amount': new FormControl([null, [Validators.required, Validators.max(999), Validators.min(1)]])
  });

  public myBalance: Balance;
  public myUserId: string;
  public me: User;
  private chart: any;
  private chartData = {
    labels: [],//chartData.map(data => data.name),
    datasets: [{
      label: 'Я должен',
      data: [],//chartData.map(data => data.negative),
      backgroundColor: Array(10).fill('rgb(255, 99, 132)'),
      datalabels: {
        align: 'center',
        anchor: 'center',
        offset: 10,
      }
    }, {
      label: 'Мне должен',
      data: [],//chartData.map(data => data.positive),
      backgroundColor: Array(10).fill('rgb(54, 162, 235)'),
      datalabels: {
        anchor: 'center',
        clamp: true
      }
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

  public onChangePerson() {
    this.formGroup.controls.amount.setValue(this.chartData.datasets[0].data[this.persons.findIndex(name => this.selectedPerson === name)]);
  }

  public reduce() {
    console.log(this.formGroup);
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
    this.persons = this.chartData.labels;
    this.selectedPerson = this.persons[0];
    this.formGroup.controls.amount.setValue(this.chartData.datasets[0].data[this.persons.findIndex(name => this.selectedPerson === name)]);
    if (this.chart) {
      this.chart.update();
      return;
    }
    // @ts-ignore
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
            anchor: 'center',
          },
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
