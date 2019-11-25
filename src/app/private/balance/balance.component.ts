import {Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges} from '@angular/core';
import {FirebaseService} from '../../service/firebase.service';
import {AuthorizationService} from '../../service/authorization.service';
import {AllBalance, Balance} from './balance';
import {User} from '../../service/model/user';
import {Subscription} from 'rxjs';
import {Chart} from 'chart.js';
import * as ChartLabelPlugin from 'chartjs-plugin-datalabels';
import {FormBuilder, FormControl, Validators} from '@angular/forms';
import {Note} from '../add-new-note/note';

@Component({
    selector: 'app-balance',
    templateUrl: './balance.component.html',
    styleUrls: ['./balance.component.scss']
})
export class BalanceComponent implements OnInit, OnChanges, OnDestroy {

    constructor(private firebaseService: FirebaseService, private authService: AuthorizationService, private formBuilder: FormBuilder) {
    }

    @Input()
    public isActive: boolean;

    public persons: string[] = [];
    public selectedPerson: string;
    public maxValue: number;
    public hasError = false;
    public amountControl = new FormControl(null, [Validators.required, Validators.max(999), Validators.min(1)]);
    public myBalance: Balance;
    public myUserId: string;
    public me: User;
    private chart: any;
    private chartData = {
        labels: [], // chartData.map(data => data.name),
        datasets: [{
            label: 'Я должен',
            data: [], // chartData.map(data => data.negative),
            backgroundColor: Array(10).fill('rgb(255, 99, 132)'),
            datalabels: {
                align: 'center',
                anchor: 'center',
                offset: 10,
            }
        }, {
            label: 'Мне должен',
            data: [], // chartData.map(data => data.positive),
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
        this.maxValue = this.chartData.datasets[1].data[this.persons.findIndex(name => this.selectedPerson === name)];
        this.amountControl = new FormControl(null, [Validators.required, Validators.max(this.maxValue), Validators.min(1)]);
        this.amountControl.setValue(this.maxValue);
    }

    public async reduce() {
        if (!this.amountControl.value) {
            this.amountControl.setErrors({max: this.maxValue});
            return;
        }
        const value = this.amountControl.value;
        const person = await this.firebaseService.userService.getUserByName(this.selectedPerson);
        await this.firebaseService.balanceService.reduceBalance(this.myUserId, person.id, value);

        const newNote = new Note(new Date().getTime(), value, this.me, 'Списал долг',
            [{money: value, personId: parseInt(person.id)}], true);

        await this.firebaseService.historyService.addNewNote(newNote, true);
    }

    public async commonReduce() {
        const reduceMap = await this.firebaseService.balanceService.commonReduce(this.myUserId);
        if (reduceMap) {
            const userIds = Array.from(reduceMap.keys());
            for (let index = 0; index < userIds.length; index++) {
                const user = await this.firebaseService.userService.getUser(userIds[index]);
                const value = reduceMap.get(user.id.toString());
                let newNote = new Note(new Date().getTime(), value, user, 'Списал долг',
                    [{money: value, personId: parseInt(this.myUserId)}], true);
                await this.firebaseService.historyService.addNewNote(newNote, true);

                newNote = new Note(new Date().getTime(), value, this.me, 'Списал долг',
                    [{money: value, personId: parseInt(user.id)}], true);
                await this.firebaseService.historyService.addNewNote(newNote, true);
            }
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

    private async drawChart() {
        if (!this.isActive) {
            return;
        }
        await this.findPersonToReduce();
        this.selectedPerson = this.persons[0];
        this.maxValue = this.chartData.datasets[1].data[this.persons.findIndex(name => this.selectedPerson === name)];
        this.amountControl = new FormControl(null, [Validators.required, Validators.max(this.maxValue), Validators.min(1)]);
        this.amountControl.setValue(this.maxValue);
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
                        fontFamily: 'Roboto',
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
                            family: 'Roboto',
                        },
                        anchor: 'center',
                    },
                }
            },
            plugins: [ChartLabelPlugin]
        });
    }

    private async findPersonToReduce() {
        this.persons = [];
        const userIds = Array.from(Object.keys(this.myBalance.positive));
        for (let index = 0; index < userIds.length; index++) {
            if (this.myBalance.positive[userIds[index]] > 0) {
                this.persons.push((await this.firebaseService.userService.getUser(userIds[index])).first_name);
            }
        }
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
