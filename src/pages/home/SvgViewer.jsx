// SvgViewer.jsx
import { ReactSVG } from 'react-svg';

const SvgViewer = ({ filePathSvg, topicMqtt, setValSvg }) => {
    return (
        <ReactSVG
            src={filePathSvg}
            beforeInjection={(svg) => {
                svg.setAttribute('width', '100%');
                svg.setAttribute('height', '100%');
                svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
                if (setValSvg) setValSvg(topicMqtt, svg);
            }}
            style={{ width: '100%', height: '100%' }}
        />
    );
};

export default SvgViewer;
