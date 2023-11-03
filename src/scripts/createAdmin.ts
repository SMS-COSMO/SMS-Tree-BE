import { UserController } from '../controllers/user';

const userController = new UserController();
await userController.register({ username: 'admin', id: 'admin', password: '12345678', role: 'admin' });
console.log('Created default admin user. \nUserID: `admin` \nUsername: `admin` \nPassword: `12345678`');
const admin = await userController.login('admin', '12345678');
console.log('Admin AccessToken:');
console.log(admin?.accessToken);
