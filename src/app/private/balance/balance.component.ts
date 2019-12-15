import {Component, Input, OnChanges, SimpleChanges} from '@angular/core';
import {FirebaseService} from "../../service/firebase.service";
import {AuthorizationService} from "../../service/authorization.service";
import {AllBalance, Balance} from "./balance";
import {User} from "../../service/model/user";
import {Chart} from "chart.js";
import * as ChartLabelPlugin from "chartjs-plugin-datalabels";
import {FormBuilder, Validators} from "@angular/forms";

@Component({
  selector: 'app-balance',
  templateUrl: './balance.component.html',
  styleUrls: ['./balance.component.scss']
})
export class BalanceComponent implements OnChanges {

  constructor(private firebaseService: FirebaseService, private authService: AuthorizationService, private formBuilder: FormBuilder) {
  }

  @Input()
  public isActive: boolean;
  @Input()
  public allBalances: AllBalance;
  @Input()
  public allUsers: User[];
  @Input()
  public me: User;

  public maxValue: number;
  public loading: boolean = false;
  public hasCredits: boolean = false;
  public hasMetualCredits: boolean = false;

  public persons: string[] = [];
  public selectedPerson: string;
  public allCredit: number;
  public goodFriends = false;
  public formGroup = this.formBuilder.group({
    'amount': [null, [Validators.required, Validators.max(999), Validators.min(1)]]
  });

  public myBalance: Balance;
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

  public onBalanceUpdate(): void {
    if (!this.allBalances || !this.allUsers || !this.me) {
      return;
    }
    this.myBalance = this.allBalances[this.me.id];
    console.log('update my balance');
    this.prepareChartData();

    if (this.chartData.labels.length > 0) {
      this.goodFriends = false;
      this.drawChart();
    } else {
      this.goodFriends = true;
    }
  }

  public onChangePerson() {
    this.maxValue = this.chartData.datasets[1].data[this.persons.findIndex(name => this.selectedPerson === name)];
    this.formGroup.controls.amount.setValue(this.maxValue);
    this.formGroup.controls.amount.setValidators([Validators.required, Validators.max(this.maxValue), Validators.min(1)]);
    this.formGroup.controls.amount.updateValueAndValidity();
  }

  public async reduce() {
    if (!this.formGroup.valid) {
      return;
    }
    this.loading = true;
    await this.firebaseService.balanceService.reduceCredit(this.formGroup.controls.amount.value, this.me, await this.firebaseService.userService.getUserByName(this.selectedPerson));
    // this.firebaseService.historyService.getAllUsers()
    this.loading = false;
  }

  public async mutualReduce() {
    this.loading = true;
    await this.firebaseService.balanceService.mutualReduceCredit(this.me);
    // this.firebaseService.historyService.getAllUsers()
    this.loading = false;
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
    Object.keys(tempChartData).forEach(key => {
      if (tempChartData[key].positive === 0 && tempChartData[key].negative === 0) {
        delete tempChartData[key];
      }
    });
    this.chartData.labels = Object.values(tempChartData).map((data: any) => data.name);
    this.chartData.datasets[0].data = Object.values(tempChartData).map((data: Balance) => data.negative);
    this.chartData.datasets[1].data = Object.values(tempChartData).map((data: Balance) => data.positive);
  }

  private drawChart() {
    if (!this.isActive) {
      return;
    }
    this.persons = Object.keys(this.myBalance.positive).filter(key => this.myBalance.positive[key] > 0).map(key => this.firebaseService.userService.getForceUser(key).first_name);
    this.selectedPerson = this.persons.indexOf(this.selectedPerson) > -1 ? this.selectedPerson : this.persons[0];
    // @ts-ignore
    this.hasCredits = Object.values(this.myBalance.positive).reduce((a: number, b: number) => a + b, 0) > 0;
    this.hasMetualCredits = this.hasMetualCreditsValues();
    // @ts-ignore
    this.allCredit = Math.abs(Object.values(this.myBalance.negative).reduce((a: number, b: number) => a + b, 0));
    this.onChangePerson();
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
    if (this.isActive) {
      setTimeout(() => this.onBalanceUpdate(), 0);
    }
  }

  private hasMetualCreditsValues(): boolean {
    return Object.keys(this.myBalance.negative).some(key => {
      return this.myBalance.positive[key] > 0 && this.myBalance.negative[key] < 0;
    })
  }
}
