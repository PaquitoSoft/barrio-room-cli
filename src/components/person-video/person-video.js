import React, { useRef, useEffect } from 'react';
import Logger from '../../plugins/logger';

const logger = new Logger('PersonVideo');

const styles = {
    videoStream: {
        width: '100%',
        borderRadius: 6
    }
};

function PersonVideo({ personData, stream }) {
	const $video = useRef();
	// logger.log(`Rendering ${personData} with stream: ${stream}`);

	useEffect(() => {
		$video.current.srcObject = stream;
	}, [stream]);

    return (
        <div className="person-video">
            <video 
                ref={$video} 
                style={styles.videoStream}
                playsInline 
                muted 
                autoPlay 
            />
			<div className="person-video">{personData && personData.nickname}</div>
        </div>
    );
}

export default PersonVideo;
