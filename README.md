<!-- PROJECT LOGO -->
<div align="center">

  <h3 align="center">ROS 2 Control Ecosystem Visualization</h3>

  <p align="center">
   Visualize Nodes in a intutive Directed Acyclic Graph format - Get realtime updates
    <br />
    <a href="https://ros-control-viz.vercel.app/">Try Demo</a>
  </p>
</div>
 
<!-- TABLE OF CONTENTS -->
<details>
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#about-the-project">About The Project</a>
      <ul>
        <li><a href="#built-with">Built With</a></li>
      </ul>
    </li>
    <li>
      <a href="#getting-started">Getting Started</a>
      <ul>
        <li><a href="#prerequisites">Prerequisites</a></li>
        <li><a href="#installation">Installation</a></li>
      </ul>
    </li>
    <li><a href="#usage">Usage</a></li>
    <li><a href="#roadmap">Roadmap</a></li>
    <li><a href="#contributing">Contributing</a></li>
    <li><a href="#license">License</a></li>
    <li><a href="#contact">Contact</a></li>
    <li><a href="#acknowledgments">Acknowledgments</a></li>
  </ol>
</details>

<!-- ABOUT THE PROJECT -->

## About The Project

This project is a ROS 2-based Directed Acyclic Graph (DAG) visualizer that subscribes to a custom topic, processes incoming messages, and updates a graph dynamically. The graph is interactive, displays metadata, and distinguishes edges based on the message attributes.

### Built With

- ![Next.js](https://img.shields.io/badge/Next.js-%23000000.svg?style=for-the-badge&logo=next-dot-js&logoColor=white)
- ![Tailwind CSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)
- ![shadcn/ui](https://img.shields.io/badge/shadcn-ui-000000.svg?style=for-the-badge&logo=shadcn&logoColor=white)
- ![WebSockets](https://img.shields.io/badge/WebSockets-000000.svg?style=for-the-badge&logo=websocket&logoColor=white)

## Features

- **ROS 2 Subscription & Service Call**: A ROS 2 node subscribes to a topic and sends a service request.
- **Custom Message Definition**: Implements a custom message format for defining directed edges.
- **TypeScript-based Graph Visualization**: The DAG is displayed using TypeScript, earning extra points for interactivity and metadata display.
- **Dynamic Graph Updates**: Graph updates in real-time based on received ROS messages.
- **Metadata Display**: Each node contains metadata information for better visualization.
- **Edge Coloring Rules**:
  - **Command interface (`command_interface = true`)**: Edge is shown in a specific color.
  - **State interface (`state_interface = true`)**: Another distinct color.
  - **Hardware-based (`is_hardware = true`)**: Highlighted accordingly.

## Custom Message Definition

This project defines a custom ROS 2 message type:

```msg
string start
string end
bool command_interface
bool state_interface
bool is_hardware
string metadata
```

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- GETTING STARTED -->

## Getting Started

### Prerequisites

- For ROS package

  - Install ROS2 - Jazzy ([Documentation](https://docs.ros.org/en/jazzy/Installation.html))
  - Clone and Setup ROS2 Workspace - [ros2_control_viz](https://github.com/Malay-dev/ros2_control_viz)

- For Web Interface
  - Node.js (LTS recommended)
  - `npm or yarn`

### Setup Instructions

```bash
git clone https://github.com/Malay-dev/ros2_control_web.git
```

```bash
cd ros2_control_web
```

```bash
npm install
```

```bash
npm run dev
```

The server will start at `http://localhost:3000`, after the ros2 package [ros2_control_viz](https://github.com/Malay-dev/ros2_control_viz) is setup and running the values will start populating and connection status will be `connected`;

Photo
+GIF
+VIDEO

<!-- ROADMAP -->

## Roadmap

- [x] Add Readme
- [ ] Stricter Type Checks
- [ ] User Interface/User Experience
- [ ] Dynamic Layout lags
- [ ] Research for better graph simulations
- [ ] Add More Examples

See the [open issues](https://github.com/Malay-dev/ros2_control_web/issues) for a full list of proposed features (and known issues).

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- CONTRIBUTING -->

## Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

If you have a suggestion that would make this better, please fork the repo and create a pull request. You can also simply open an issue with the tag "enhancement".
Don't forget to give the project a star⭐! Thanks again!

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- LICENSE -->

## License

Distributed under the MIT License. See `LICENSE.txt` for more information.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Maintainer

Malay Kumar - [@void_MalayK](https://twitter.com/void_MalayK) | [@malayk](https://www.linkedin.com/in/malayk/)

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- ACKNOWLEDGMENTS -->

<!-- MARKDOWN LINKS & IMAGES -->
<!-- https://www.markdownguide.org/basic-syntax/#reference-style-links -->
