import { MasterDataLayout } from '../../components/MasterDataLayout';
import { masterSchemas } from '../../config/masterSchema';

const MasterPointList: React.FC = () => {
    return (
        <MasterDataLayout schema={masterSchemas.points} />
    );
};

export default MasterPointList;
