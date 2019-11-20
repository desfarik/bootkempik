import firebase from "firebase";

export abstract class BaseFunctionsService {
  protected constructor(protected functions: firebase.functions.Functions) {
  }

  protected call(methodName, args) {
    return this.functions.httpsCallable(methodName)(Object.assign(args))
  }

}
