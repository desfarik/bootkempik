import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ElementRef,
    Input,
    OnInit,
    ViewChild
} from '@angular/core';

const NEED_RESIZE_IMAGE_SIZE = 1024 * 1000;
const MAX_IMAGE_SIZE = 1024 * 2000;

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

    @ViewChild('photo', {static: false})
    photoElement: ElementRef<HTMLImageElement>;

    @ViewChild('photoInput', {static: true})
    photoInput: ElementRef<HTMLInputElement>;

    @ViewChild('canvasElement', {static: true})
    canvasElement: ElementRef<HTMLCanvasElement>;

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

        reader.onload = async (readerEvent) => {
            let base64 = readerEvent.target.result as string;
            if (photo.size > NEED_RESIZE_IMAGE_SIZE) {
                base64 = await this.resizeImage(base64, Number((NEED_RESIZE_IMAGE_SIZE / photo.size).toFixed(1)));
                if (!base64) {
                    return;
                }
                const blob = new Blob([base64]);
                if (blob.size > MAX_IMAGE_SIZE) {
                    return;
                }
            }
            this.photoUrl = base64;
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
    }

    reset() {
        this.rotateDeg = 0;
    }

    deleteImage() {
        this.exitFromViewMode();
        this.reset();
        this.photoUrl = null;
    }

    getImageBase64() {
        return this.photoUrl;
    }

    private resizeImage(base64: string, quality: number): Promise<string> {
        return new Promise(resolve => {
            const context = this.canvasElement.nativeElement.getContext('2d');
            const img = new Image();
            img.onload = () => {
                this.canvasElement.nativeElement.width = img.width;
                this.canvasElement.nativeElement.height = img.height;
                this.changeDetection.detectChanges();
                context.drawImage(img, 0, 0);
                const resizedBase64 = this.canvasElement.nativeElement.toDataURL('image/jpeg', Math.max(0.25, quality));
                resolve(resizedBase64);
            };
            img.onerror = () => {
                resolve(null);
            };
            img.src = base64;
        });
    }
}
