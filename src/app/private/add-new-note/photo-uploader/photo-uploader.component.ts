import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ElementRef,
    Input,
    OnInit,
    ViewChild
} from '@angular/core';

@Component({
    selector: 'app-photo-uploader',
    templateUrl: './photo-uploader.component.html',
    styleUrls: ['./photo-uploader.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PhotoUploaderComponent implements OnInit {
    @Input()
    photoUrl: string;
    @Input()
    readonly = false;

    loading = false;
    viewMode = false;
    rotateDeg = 0;
    zoomPercent = 0;

    @ViewChild('photo', {static: false})
    photoElement: ElementRef<HTMLImageElement>;

    @ViewChild('photoInput', {static: true})
    photoInput: ElementRef<HTMLInputElement>;

    constructor(private changeDetection: ChangeDetectorRef) {
    }

    ngOnInit(): void {
    }

    onPhotoUploaderClick() {
        if (this.readonly || this.photoUrl) {
            this.viewMode = true;
            return;
        }
        this.photoInput.nativeElement.click();
    }

    exitFromViewMode() {
        this.viewMode = false;
    }

    onSelectPhoto(event) {
        if (!(event.target.files[0] instanceof Blob)) {
            return;
        }
        this.loading = true;
        this.changeDetection.detectChanges();

        const photo = event.target.files[0];
        const reader = new FileReader();

        reader.onload = (readerEvent) => {
            this.photoUrl = readerEvent.target.result as string;
            this.changeDetection.detectChanges();
            this.photoElement.nativeElement.onload = () => {
                this.loading = false;
                this.changeDetection.detectChanges();
            };
        };
        reader.readAsDataURL(photo);
    }

    rotateImage(deg) {
        this.rotateDeg += deg;
        this.changeDetection.detectChanges();
    }

    zoom(percent) {
        if (percent < 0 && -70 > this.zoomPercent) {
            return;
        }
        const dZoom = (this.zoomPercent + 100) / 3 * percent;
        this.zoomPercent += dZoom;

    }
}
