//Візьміть декоратор DeprecatedMethod і навчіть його працювати з об'єктом, який вміє приймати причину, через яку його не варто використовувати, і назву методу, яким його можна замінити, якщо це можливо.

//Створіть декоратори MinLength, MaxLength та Email. 

//Використайте попередню версію декораторів і зробіть так, щоб їх можно було використовувати разом.

// 1.
class DeprecatedInfo {
    constructor(public readonly reason: string, public readonly replacement?: string) {}
}

function DeprecatedMethod(info: DeprecatedInfo): MethodDecorator {
    return function (target: any, methodName: string | symbol, descriptor: PropertyDescriptor): PropertyDescriptor {
        const originalMethod = descriptor.value;

        descriptor.value = function (this: any, ...args: any[]): void {
            console.warn(`Warning: Method '${String(methodName)}' is deprecated. Reason: ${info.reason}`);

            if (info.replacement) {
                console.warn(`Replacement: ${info.replacement}`);
            }

            originalMethod.apply(this, args);
        };

        return descriptor;
    };
}

// 2.
function MinLength(minLength: number) {
    return function (target: any, propertyName: string, descriptor: PropertyDescriptor): PropertyDescriptor | void {
        const originalSetter = descriptor.set;

        if (!originalSetter) {
            throw new Error('Invalid decorator use. Make sure MinLength is applied to a setter method.');
        }

        descriptor.set = function (this: any, value: string): void {
            if (value.length < minLength) {
                throw new Error(`${propertyName} should have a minimum length of ${minLength}.`);
            }
            originalSetter.call(this, value);
        };

        return descriptor;
    };
}

function MaxLength(maxLength: number) {
    return function (target: any, propertyName: string, descriptor: PropertyDescriptor): PropertyDescriptor | void {
        const originalSetter = descriptor.set;

        if (!originalSetter) {
            throw new Error('Invalid decorator use. Make sure MaxLength is applied to a setter method.');
        }

        descriptor.set = function (this: any, value: string): void {
            if (value.length > maxLength) {
                throw new Error(`${propertyName} should have a maximum length of ${maxLength}.`);
            }
            originalSetter.call(this, value);
        };

        return descriptor;
    };
}

function Email(target: any, propertyName: string, descriptor: PropertyDescriptor): PropertyDescriptor | void {
    const originalSetter = descriptor.set;

    if (!originalSetter) {
        throw new Error('Invalid decorator use. Make sure Email is applied to a setter method.');
    }

    descriptor.set = function (this: any, value: string): void {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
            throw new Error(`${propertyName} should be a valid email address.`);
        }
        originalSetter.call(this, value);
    };

    return descriptor;
}

// 3.
class User {
    private _email: string = '';

    @DeprecatedMethod({ reason: 'Deprecated', replacement: 'newMethod' })
    @MinLength(5)
    @MaxLength(20)
    @Email
    set email(value: string): void {
        this._email = value;
    }
}

const user = new User();
user.email = 'test@example.com';
user.email = 'short';
user.email = 'toolongemailaddress@example.com';
user.email = 'invalidemail';

