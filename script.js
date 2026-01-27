document.addEventListener("DOMContentLoaded", () => {
  // 移动端菜单切换
  const menuToggle = document.querySelector(".menu-toggle");
  const navLinks = document.querySelector(".nav-links");
  const links = document.querySelectorAll(".nav-links li");

  menuToggle.addEventListener("click", () => {
    navLinks.classList.toggle("active");

    // 汉堡菜单图标动画
    const icon = menuToggle.querySelector("i");
    if (navLinks.classList.contains("active")) {
      icon.classList.remove("fa-bars");
      icon.classList.add("fa-times");
    } else {
      icon.classList.remove("fa-times");
      icon.classList.add("fa-bars");
    }
  });

  // 点击链接关闭菜单
  links.forEach((link) => {
    link.addEventListener("click", () => {
      navLinks.classList.remove("active");
      const icon = menuToggle.querySelector("i");
      icon.classList.remove("fa-times");
      icon.classList.add("fa-bars");
    });
  });

  // 导航栏滚动效果
  const navbar = document.querySelector(".navbar");
  window.addEventListener("scroll", () => {
    if (window.scrollY > 50) {
      navbar.classList.add("scrolled");
    } else {
      navbar.classList.remove("scrolled");
    }
  });

  // 滚动动画 (Intersection Observer)
  const observerOptions = {
    threshold: 0.1,
    rootMargin: "0px 0px -50px 0px",
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("show");
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  const fadeElements = document.querySelectorAll(".fade-in");
  fadeElements.forEach((el) => {
    el.classList.add("hidden");
    observer.observe(el);
  });

  // 平滑滚动 (兼容旧浏览器)
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute("href"));
      if (target) {
        target.scrollIntoView({
          behavior: "smooth",
        });
      }
    });
  });

  // 动态获取 GitHub 项目
  fetchProjects();
});

async function fetchProjects() {
  const container = document.getElementById('projects-container');
  const username = 'Dhgaj';

  try {
    const response = await fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=6`);
    if (!response.ok) throw new Error('GitHub API request failed');

    const validRepos = (await response.json())
      .filter(repo => !repo.fork) // 仅展示非Fork项目 (根据API返回结果，目前似乎都是自建)
      .slice(0, 3); // 取前3个

    if (validRepos.length === 0) {
      container.innerHTML = '<p style="text-align:center; grid-column:1/-1;">暂无公开项目</p>';
      return;
    }

    // 清空加载动画
    container.innerHTML = '';

    validRepos.forEach((repo, index) => {
      const card = createProjectCard(repo, index);
      container.appendChild(card);

      // 触发入场动画
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('show');
            observer.unobserve(entry.target);
          }
        });
      });
      observer.observe(card);
    });

  } catch (error) {
    console.error('Error fetching projects:', error);
    container.innerHTML = '<p style="text-align:center; grid-column:1/-1;">无法加载项目，请稍后重试。</p>';
  }
}

function createProjectCard(repo, index) {
  const article = document.createElement('article');
  article.className = `project-card glass fade-in delay-${index}`;

  // 根据语言选择图标和渐变色
  let iconClass = 'fas fa-code';
  let gradientClass = 'gradient-1';

  const lang = repo.language || 'Other';
  if (lang.includes('JavaScript') || lang.includes('TypeScript')) {
    iconClass = 'fab fa-js';
    gradientClass = 'gradient-2';
  } else if (lang.includes('Python')) {
    iconClass = 'fab fa-python';
    gradientClass = 'gradient-3';
  } else if (lang.includes('HTML') || lang.includes('CSS')) {
    iconClass = 'fab fa-html5';
    gradientClass = 'gradient-1';
  } else if (lang.includes('Swift')) {
    iconClass = 'fas fa-mobile-alt';
    gradientClass = 'gradient-2';
  }

  const description = repo.description || '暂无描述';

  article.innerHTML = `
        <div class="card-image-placeholder ${gradientClass}">
            <i class="${iconClass}"></i>
        </div>
        <div class="card-content">
            <h3>${repo.name}</h3>
            <p>${description}</p>
            <div class="tags">
                <span>${lang}</span>
                <span>★ ${repo.stargazers_count}</span>
            </div>
            <div class="card-links">
                <a href="${repo.html_url}" target="_blank" class="link-text">GitHub <i class="fas fa-arrow-right"></i></a>
            </div>
        </div>
    `;

  return article;
}
