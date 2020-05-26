import * as common from '..';

const installer = new common.ElectronInstaller({});
await installer.copyApplication(async() => true);
