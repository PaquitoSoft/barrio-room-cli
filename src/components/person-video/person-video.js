import React, { useRef } from 'react';

const styles = {
    videoStream: {
        width: '100%',
        borderRadius: 6
    }
};

function PersonVideo({ personData, stream }) {
    const $video = useRef();

    if ($video.current) {
        $video.current.srcObject = stream;
    }

    return (
        <div className="person-video">
            <video 
                ref={$video} 
                style={styles.videoStream}
                playsInline 
                muted 
                autoPlay 
            />
        </div>
    );
}

export default PersonVideo;