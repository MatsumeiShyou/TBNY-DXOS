import { MasterDataLayout } from '../../components/MasterDataLayout';
import { masterSchemas } from '../../config/masterSchema';

const MasterVehicleList: React.FC = () => {
    return (
        <MasterDataLayout schema={masterSchemas.vehicles} />
    );
};

export default MasterVehicleList;
