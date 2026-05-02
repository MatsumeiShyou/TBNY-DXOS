import { MasterDataLayout } from '../../components/MasterDataLayout';
import { masterSchemas } from '../../config/masterSchema';

const MasterItemList: React.FC = () => {
    return (
        <MasterDataLayout schema={masterSchemas.items} />
    );
};

export default MasterItemList;
