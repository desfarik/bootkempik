import {ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnChanges, SimpleChanges} from '@angular/core';
import {User} from '../../../service/model/user';
import {SelectParticipantsDialog} from '../dialog/select-participants/select-participants-dialog.component';
import {MatDialog} from '@angular/material';
import {AbstractControl} from '@angular/forms';
import {MoneyPerPerson} from '../note';

interface SelectedPerson extends User {
    selected: boolean;
    double: boolean;
    manual: boolean;
    amount: number;
}

@Component({
    selector: 'app-money-spreader',
    templateUrl: './money-spreader.component.html',
    styleUrls: ['./money-spreader.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MoneySpreaderComponent implements OnChanges {
    @Input()
    persons: User[];
    @Input()
    amount: string;
    @Input()
    control: AbstractControl;
    doublePersonCount = 0;


    selectedPersons: SelectedPerson[] = [];

    constructor(private dialog: MatDialog, private changeDetector: ChangeDetectorRef) {
    }


    ngOnChanges(changes: SimpleChanges): void {
        this.calculateMoneyPerPerson();
    }


    public setMoneyPerPerson(persons, moneyPerPersons: MoneyPerPerson): void {
        this.selectedPersons = persons.map(person => {
            const moneyPerPerson = moneyPerPersons[person.id];
            if (moneyPerPerson) {
                const newPerson = {...person} as SelectedPerson;
                newPerson.amount = moneyPerPerson.money;
                newPerson.manual = moneyPerPerson.manual;
                newPerson.double = moneyPerPerson.double;
                return newPerson;
            }
            return null;
        }).filter(person => !!person);
    }

    public getMoneyPerPerson(): MoneyPerPerson {
        return this.selectedPersons.reduce((result: MoneyPerPerson, person) => {
            result[person.id] = {
                money: person.amount,
                manual: person.manual,
                double: person.double,
                paid: false,
            };
            return result;
        }, {});
    }

    public onManualChange(person, event, matInputWrapper) {
        if (isNaN(event.target.valueAsNumber)) {
            matInputWrapper._elementRef.nativeElement.classList.add('mat-form-field-invalid');
            this.control.setErrors({amountError: true});
            return;
        }
        person.amount = event.target.valueAsNumber || 0;
        if (!this.calculateMoneyPerPerson()) {
            matInputWrapper._elementRef.nativeElement.classList.add('mat-form-field-invalid');
        } else {
            matInputWrapper._elementRef.nativeElement.classList.remove('mat-form-field-invalid');
        }
    }

    public toggleDoubleRate(person) {
        if (person.manual) {
            return;
        }
        person.double = !person.double;
        this.calculateMoneyPerPerson();
    }

    public toggleAutoRate(person) {
        person.manual = !person.manual;
        person.double = false;
        this.calculateMoneyPerPerson();
    }

    public openDialog() {
        const persons = this.persons.map(person => {
            const user = {...person} as SelectedPerson;
            user.selected = !!this.selectedPersons.find(sPerson => sPerson.id === person.id);
            return user;
        });
        this.dialog.open(SelectParticipantsDialog, {
            width: '80%',
            autoFocus: false,
            disableClose: true,
            data: {
                persons,
            }
        }).afterClosed().subscribe((selectedPersons) => {
            if (!selectedPersons) {
                return;
            }
            this.selectedPersons = selectedPersons;
            this.calculateMoneyPerPerson();
            this.control.setValue(this.selectedPersons);
            this.changeDetector.detectChanges();
        });
    }

    private calculateMoneyPerPerson(): boolean {
        if (!this.amount) {
            return;
        }
        const manualAmount = this.selectedPersons.reduce((result, person) => {
            if (person.manual) {
                return result + (person.amount || 0);
            }
            return result;
        }, 0);

        const remainder = Number(this.amount) - manualAmount;
        if (remainder < 0) {
            this.control.setErrors({amountError: true});
            return;
        }
        const autoPersonQuantity = this.selectedPersons.reduce((result, person) => {
            if (person.manual) {
                return result;
            }
            return result + (person.double ? 2 : 1);
        }, 0);
        const perPerson = remainder / autoPersonQuantity;
        this.selectedPersons.forEach((person) => {
            if (!person.manual) {
                const amount = person.double ? perPerson * 2 : perPerson;
                person.amount = Number(amount.toFixed(2));
            }
        });
        this.control.setErrors(null);
        return true;
    }
}
