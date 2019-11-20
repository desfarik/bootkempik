export class User {
  public first_name: string;
  public id: string;
  public last_name: string;
  public photo_200_orig: string;

  constructor(user: any) {
    const {first_name, id, last_name, photo_200_orig} = user;
    this.first_name = first_name;
    this.last_name = last_name;
    this.id = id;
    this.photo_200_orig = photo_200_orig;
  }
}

