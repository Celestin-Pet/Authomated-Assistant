import time
import numpy as np
import cereal.messaging as messaging
from bodyjim import BodyEnv

# Constants
LANDMARK_TARGET = "Coffee Machine"
SEARCH_ROTATION_SPEED = 0.5  # rad/s
FORWARD_SPEED = 0.2  # m/s
PID_P = 0.005  # Proportional gain for centering
IMAGE_WIDTH = 1920  # Front camera width

class OfficeAssistant:
    def __init__(self):
        # Subscribe to Cereal messages
        self.sm = messaging.SubMaster(['cameraState', 'navInstruction'])
        
        # Initialize Body environment
        self.env = BodyEnv()
        self.env.reset()
        
        self.target_landmark = LANDMARK_TARGET
        self.last_detection_time = 0
        self.is_searching = False

    def get_vlm_detection(self, frame):
        """
        Mock function to represent VLM reasoning on eGPU.
        In reality, this would send the frame to a local VLM (Moondream2/Llama-3-Vision)
        and return (x, y) coordinates if found.
        """
        # This is where you'd call your eGPU-based VLM
        # For the hackathon, you might use a zero-shot detector like Owl-ViT
        # return x_coord, y_coord or None
        return None  # Mocking 'not found' initially

    def run(self):
        print(f"Starting Office Assistant. Target: {self.target_landmark}")
        
        while True:
            self.sm.update(0)
            
            # Check for new mission instructions
            if self.sm.updated['navInstruction']:
                new_target = self.sm['navInstruction'].instruction
                if new_target != self.target_landmark:
                    print(f"New Mission: {new_target}")
                    self.target_landmark = new_target
            
            # Get camera frame
            if self.sm.updated['cameraState']:
                # In a real setup, you'd pull the H.265 stream via webrtcd
                # Here we assume we can get a frame from the submaster or bodyjim
                frame = self.env.get_camera_frame() # Hypothetical bodyjim method
                
                detection = self.get_vlm_detection(frame)
                
                if detection:
                    x, y = detection
                    self.last_detection_time = time.time()
                    self.is_searching = False
                    
                    # PID Control to center landmark
                    error = x - (IMAGE_WIDTH / 2)
                    steer = -error * PID_P
                    
                    # Move towards landmark
                    self.env.step(velocity=FORWARD_SPEED, rotation=steer)
                    print(f"Navigating to {self.target_landmark}. Error: {error:.2f}")
                else:
                    # Search pattern if not found for > 2 seconds
                    if time.time() - self.last_detection_time > 2:
                        self.is_searching = True
                        self.env.step(velocity=0, rotation=SEARCH_ROTATION_SPEED)
                        print(f"Searching for {self.target_landmark}...")
                    else:
                        # Coast for a bit
                        self.env.step(velocity=FORWARD_SPEED * 0.5, rotation=0)

            time.sleep(0.05)  # 20Hz loop

if __name__ == "__main__":
    assistant = OfficeAssistant()
    assistant.run()
