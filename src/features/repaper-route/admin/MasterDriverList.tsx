import { MasterDataLayout } from '../../components/MasterDataLayout';
import { masterSchemas } from '../../config/masterSchema';

const MasterDriverList: React.FC = () => {
    return <MasterDataLayout schema={masterSchemas.drivers} />;
};

export default MasterDriverList;
