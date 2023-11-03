import { UserController } from '../controllers/user';

const userController = new UserController();
await userController.register({ username: 'admin1', id: 'admin1', password: 'admin123', role: 'admin' });
console.log('Created default admin user. \nUserID: `admin1` \nUsername: `admin1` \nPassword: `admin123`');
const admin = await userController.login('admin1', 'admin123');
console.log('Admin AccessToken:');
console.log(admin?.accessToken);